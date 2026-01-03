import { Invoice } from "../models/invoice.models.js";
import { Quotation } from "../models/quotation.models.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";


export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Total counts
  const [totalQuotations, totalInvoices] = await Promise.all([
    Quotation.countDocuments(),
    Invoice.countDocuments()
  ]);

  // 30-day counts
  const [quotations30d, invoices30d] = await Promise.all([
    Quotation.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Invoice.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
  ]);

  // Pending / unpaid
  const [pendingQuotations, unpaidInvoices] = await Promise.all([
    Quotation.countDocuments({
      status: { $in: ['draft', 'submitted'] }
    }),
    Invoice.aggregate([
      { $match: { paymentStatus: 'unpaid' } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$grandTotal' }
        }
      }
    ])
  ]);

  const unpaidInvoicesCount = unpaidInvoices[0]?.count || 0;
  const unpaidInvoicesAmount = unpaidInvoices[0]?.amount || 0;

  // Monthly data (last 6 months)
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const monthlyStats = await Promise.all([
    Quotation.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    Invoice.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$grandTotal" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
  ]);

  const [monthlyQuotations, monthlyInvoices] = await Promise.all([
    Quotation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    Invoice.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
  ]);

  // Fill missing months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });

  const monthlyData = months.map(month => {
    const q = monthlyQuotations.find(m => m._id.year === month.year && m._id.month === month.month);
    const i = monthlyInvoices.find(m => m._id.year === month.year && m._id.month === month.month);

    return {
      month: `${month.month.toString().padStart(2, '0')}`,
      quotations: q?.count || 0,
      invoices: i?.count || 0,
    };
  });

  const metrics = {
    totalQuotations,
    totalQuotations30d: quotations30d,
    quotationsChange: Math.round(((quotations30d / totalQuotations) * 100) || 0),

    totalInvoices,
    totalInvoices30d: invoices30d,
    invoicesChange: Math.round(((invoices30d / totalInvoices) * 100) || 0),

    pendingQuotations,
    unpaidInvoicesCount,
    unpaidInvoicesAmount,

    monthlyRevenue: monthlyStats[1].map(s => s.revenue || 0),
    monthlyQuotations: monthlyStats[0].map(s => s.count || 0),
    monthlyInvoices: monthlyStats[1].map(s => s.count || 0),

    monthlyData
  };

  return res.status(200).json(
    new ApiResponse(200, metrics, "Dashboard metrics fetched successfully!")
  );
});