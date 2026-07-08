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

          unit: {
            connect: {
              id: Number(item.unitId),
            },
          },

          quantity: Number(item.quantity),
          price: Number(item.price),
          taxRate: Number(item.taxRate) || 0,
          total: Number(item.total),
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

  return res
    .status(201)
    .json(new ApiResponse(201, invoice, "Invoice created successfully!"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, invoices, "Invoices fetched successfully!"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice fetched successfully!"));
});

const updateInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const {
    clientName,
    address,
    items,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    grandTotal,
    paymentStatus,
    quotationId,
  } = req.body;

  const existingInvoice = await prisma.invoice.findUnique({
    where: {
      id: Number(invoiceId),
    },
  });

  if (!existingInvoice) {
    throw new ApiError(404, "Invoice not found.");
  }

  // Validate quotation
  const quotation = await prisma.quotation.findUnique({
    where: {
      id: Number(quotationId),
    },
  });

  if (!quotation) {
    throw new ApiError(404, "Quotation not found.");
  }

  const updatedInvoice = await prisma.invoice.update({
    where: {
      id: Number(invoiceId),
    },

    data: {
      clientName,
      address,

      subtotal: Number(subtotal),
      taxRate: Number(taxRate) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: Number(discount) || 0,
      grandTotal: Number(grandTotal),

      paymentStatus,

      quotation: {
        connect: {
          id: Number(quotationId),
        },
      },

      items: {
        deleteMany: {},

        create: items.map((item) => ({
          description: item.description,

          unit: {
            connect: {
              id: Number(item.unitId),
            },
          },

          quantity: Number(item.quantity),
          price: Number(item.price),
          taxRate: Number(item.taxRate) || 0,
          total: Number(item.total),
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

      items: {
        include: {
          unit: {
            select: {
              id: true,
              name: true,
              shortName: true,
            },
          },
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedInvoice, "Invoice updated successfully."),
    );
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const existingInvoice = await prisma.invoice.findUnique({
    where: {
      id: Number(invoiceId),
    },
    select: {
      id: true,
      clientName: true,
    },
  });

  if (!existingInvoice) {
    throw new ApiError(404, "Invoice not found.");
  }

  await prisma.invoice.delete({
    where: {
      id: Number(invoiceId),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Invoice deleted successfully."));
});

export {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
