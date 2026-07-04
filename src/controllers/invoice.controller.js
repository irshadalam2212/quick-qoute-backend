import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";

const createInvoice = asyncHandler(async (req, res) => {
  const {
    clientName,
    address,
    items,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    grandTotal,
    quotationId,
  } = req.body;

  if (!clientName || !address || !quotationId) {
    throw new ApiError(400, "Required fields are missing.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "At least one invoice item is required.");
  }

  const quotation = await prisma.quotation.findUnique({
    where: {
      id: Number(quotationId),
    },
  });

  if (!quotation) {
    throw new ApiError(404, "Quotation not found.");
  }

  const invoice = await prisma.invoice.create({
    data: {
      clientName,
      address,

      subtotal,
      taxRate: taxRate || 0,
      taxAmount: taxAmount || 0,
      discount: discount || 0,
      grandTotal,

      paymentStatus: "UNPAID",

      quotation: {
        connect: {
          id: Number(quotationId),
        },
      },

      createdBy: {
        connect: {
          id: req.user.id,
        },
      },

      items: {
        create: items.map((item) => ({
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          price: item.price,
          taxRate: item.taxRate || 0,
          total: item.total,
        })),
      },
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      quotation: {
        select: {
          id: true,
          quotationNo: true,
        },
      },

      items: true,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, invoice, "Invoice created successfully!")
  );
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const where = {};

  if (req.query.paymentStatus) {
    where.paymentStatus = req.query.paymentStatus.toUpperCase();
  }

  const invoices = await prisma.invoice.findMany({
    where,

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      quotation: {
        select: {
          id: true,
          quotationNo: true,
        },
      },

      items: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json(
    new ApiResponse(200, invoices, "Invoices fetched successfully!")
  );
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: Number(invoiceId),
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      quotation: {
        select: {
          id: true,
          quotationNo: true,
        },
      },

      items: true,
    },
  });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return res.status(200).json(
    new ApiResponse(200, invoice, "Invoice fetched successfully!")
  );
});

export {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
};