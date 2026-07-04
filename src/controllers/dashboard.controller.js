import prisma from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  // Total counts
  const [
    totalQuotations,
    totalInvoices,
    quotations30d,
    invoices30d,
    pendingQuotations,
    unpaidInvoicesCount,
    unpaidInvoicesAmount,
  ] = await Promise.all([
    prisma.quotation.count(),

    prisma.invoice.count(),

    prisma.quotation.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),

    prisma.invoice.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),

    prisma.quotation.count({
      where: {
        status: {
          in: ["DRAFT", "SUBMITTED"],
        },
      },
    }),

    prisma.invoice.count({
      where: {
        paymentStatus: "UNPAID",
      },
    }),

    prisma.invoice.aggregate({
      where: {
        paymentStatus: "UNPAID",
      },
      _sum: {
        grandTotal: true,
      },
    }),
  ]);

  // Fetch last six months' records
  const [quotations, invoices] = await Promise.all([
    prisma.quotation.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    }),

    prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        grandTotal: true,
      },
    }),
  ]);

  // Initialize last 6 months
  const monthlyMap = new Map();

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    monthlyMap.set(key, {
      month: date.toLocaleString("default", {
        month: "short",
      }),
      quotations: 0,
      invoices: 0,
      revenue: 0,
    });
  }

  // Count quotations
  quotations.forEach((quotation) => {
    const date = new Date(quotation.createdAt);

    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (monthlyMap.has(key)) {
      monthlyMap.get(key).quotations++;
    }
  });

  // Count invoices & revenue
  invoices.forEach((invoice) => {
    const date = new Date(invoice.createdAt);

    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (monthlyMap.has(key)) {
      monthlyMap.get(key).invoices++;
      monthlyMap.get(key).revenue += invoice.grandTotal;
    }
  });

  const monthlyData = [...monthlyMap.values()];

  const metrics = {
    totalQuotations,
    totalQuotations30d: quotations30d,
    quotationsChange:
      totalQuotations === 0
        ? 0
        : Math.round((quotations30d / totalQuotations) * 100),

    totalInvoices,
    totalInvoices30d: invoices30d,
    invoicesChange:
      totalInvoices === 0
        ? 0
        : Math.round((invoices30d / totalInvoices) * 100),

    pendingQuotations,

    unpaidInvoicesCount,

    unpaidInvoicesAmount:
      unpaidInvoicesAmount._sum.grandTotal ?? 0,

    monthlyRevenue: monthlyData.map((m) => m.revenue),

    monthlyQuotations: monthlyData.map((m) => m.quotations),

    monthlyInvoices: monthlyData.map((m) => m.invoices),

    monthlyData,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      metrics,
      "Dashboard metrics fetched successfully!"
    )
  );
});