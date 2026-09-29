import prisma from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { getAuthUser } from "../utils/auth.js";

interface MonthlyStat {
  month: string;
  quotations: number;
  invoices: number;
  revenue: number;
}

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}`;

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Build month boundaries from day 1 so setMonth() cannot overflow on the 29th-31st.
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const userId = getAuthUser(req).id;

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
    prisma.quotation.count({
      where: {
        createdById: userId,
      },
    }),

    prisma.invoice.count({
      where: {
        createdById: userId,
      },
    }),

    prisma.quotation.count({
      where: {
        createdById: userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),

    prisma.invoice.count({
      where: {
        createdById: userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),

    prisma.quotation.count({
      where: {
        createdById: userId,
        status: {
          in: ["DRAFT", "SUBMITTED"],
        },
      },
    }),

    prisma.invoice.count({
      where: {
        createdById: userId,
        paymentStatus: "UNPAID",
      },
    }),

    prisma.invoice.aggregate({
      where: {
        createdById: userId,
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
        createdById: userId,
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
        createdById: userId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        grandTotal: true,
        paymentStatus: true,
      },
    }),
  ]);

  // Initialize last 6 months
  const monthlyMap = new Map<string, MonthlyStat>();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    monthlyMap.set(monthKey(date), {
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
    const stat = monthlyMap.get(monthKey(new Date(quotation.createdAt)));

    if (stat) {
      stat.quotations++;
    }
  });

  // Count invoices & paid revenue
  invoices.forEach((invoice) => {
    const stat = monthlyMap.get(monthKey(new Date(invoice.createdAt)));

    if (stat) {
      stat.invoices++;

      if (invoice.paymentStatus === "PAID") {
        stat.revenue += invoice.grandTotal;
      }
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
      totalInvoices === 0 ? 0 : Math.round((invoices30d / totalInvoices) * 100),

    pendingQuotations,

    unpaidInvoicesCount,

    unpaidInvoicesAmount: unpaidInvoicesAmount._sum.grandTotal ?? 0,

    monthlyRevenue: monthlyData.map((m) => m.revenue),

    monthlyQuotations: monthlyData.map((m) => m.quotations),

    monthlyInvoices: monthlyData.map((m) => m.invoices),

    monthlyData,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, metrics, "Dashboard metrics fetched successfully!"),
    );
});
