import { dashboardRepository } from "../repositories/dashboard.repository.js";

interface MonthlyStat {
  month: string;
  quotations: number;
  invoices: number;
  revenue: number;
}

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}`;

export const dashboardService = {
  async getMetrics(userId: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const data = await dashboardRepository.getMetricsData(
      userId,
      thirtyDaysAgo,
      sixMonthsAgo,
    );
    const monthlyMap = new Map<string, MonthlyStat>();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyMap.set(monthKey(date), {
        month: date.toLocaleString("default", { month: "short" }),
        quotations: 0,
        invoices: 0,
        revenue: 0,
      });
    }

    data.quotations.forEach((quotation) => {
      const stat = monthlyMap.get(monthKey(new Date(quotation.createdAt)));
      if (stat) stat.quotations++;
    });
    data.invoices.forEach((invoice) => {
      const stat = monthlyMap.get(monthKey(new Date(invoice.createdAt)));
      if (stat) {
        stat.invoices++;
        if (invoice.paymentStatus === "PAID")
          stat.revenue += invoice.grandTotal;
      }
    });

    const monthlyData = [...monthlyMap.values()];
    const outstanding = data.outstandingInvoices.reduce(
      (totals, invoice) => {
        const received = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const balance = Math.max(0, invoice.grandTotal - received);
        if (balance > 0.005) {
          totals.count += 1;
          totals.amount += balance;
        }
        return totals;
      },
      { count: 0, amount: 0 },
    );
    return {
      totalQuotations: data.totalQuotations,
      totalQuotations30d: data.quotations30d,
      quotationsChange:
        data.totalQuotations === 0
          ? 0
          : Math.round((data.quotations30d / data.totalQuotations) * 100),
      totalInvoices: data.totalInvoices,
      totalInvoices30d: data.invoices30d,
      invoicesChange:
        data.totalInvoices === 0
          ? 0
          : Math.round((data.invoices30d / data.totalInvoices) * 100),
      pendingQuotations: data.pendingQuotations,
      outstandingInvoicesCount: outstanding.count,
      outstandingInvoicesAmount: outstanding.amount,
      monthlyRevenue: monthlyData.map((month) => month.revenue),
      monthlyQuotations: monthlyData.map((month) => month.quotations),
      monthlyInvoices: monthlyData.map((month) => month.invoices),
      monthlyData,
    };
  },
};
