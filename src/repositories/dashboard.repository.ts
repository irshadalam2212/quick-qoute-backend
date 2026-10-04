import prisma from "../lib/prisma.js";

export const dashboardRepository = {
  async getMetricsData(
    userId: number,
    thirtyDaysAgo: Date,
    sixMonthsAgo: Date,
  ) {
    const [
      totalQuotations,
      totalInvoices,
      quotations30d,
      invoices30d,
      pendingQuotations,
      outstandingInvoices,
    ] = await Promise.all([
      prisma.quotation.count({ where: { createdById: userId } }),
      prisma.invoice.count({ where: { createdById: userId } }),
      prisma.quotation.count({
        where: { createdById: userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.invoice.count({
        where: { createdById: userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.quotation.count({
        where: { createdById: userId, status: { in: ["DRAFT", "SUBMITTED"] } },
      }),
      prisma.invoice.findMany({
        where: { createdById: userId },
        select: { grandTotal: true, payments: { select: { amount: true } } },
      }),
    ]);

    const [quotations, invoices] = await Promise.all([
      prisma.quotation.findMany({
        where: { createdById: userId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.invoice.findMany({
        where: { createdById: userId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, grandTotal: true, paymentStatus: true },
      }),
    ]);

    return {
      totalQuotations,
      totalInvoices,
      quotations30d,
      invoices30d,
      pendingQuotations,
      outstandingInvoices,
      quotations,
      invoices,
    };
  },
};