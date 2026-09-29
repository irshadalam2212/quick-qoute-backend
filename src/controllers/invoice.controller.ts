import type { ParamsDictionary } from "express-serve-static-core";
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import type { InvoiceBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { toLineItemCreate } from "../utils/lineitems.js";

type InvoiceParams = { invoiceId: string };

const invoiceInclude = {
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
} satisfies Prisma.InvoiceInclude;

const createInvoice = asyncHandler<ParamsDictionary, InvoiceBody>(
  async (req, res) => {
    const authUser = getAuthUser(req);

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
            id: authUser.id,
          },
        },

        items: {
          create: items.map(toLineItemCreate),
        },
      },

      include: invoiceInclude,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, invoice, "Invoice created successfully!"));
  },
);

const getAllInvoices = asyncHandler(async (req, res) => {
  const userId = getAuthUser(req).id;

  const invoices = await prisma.invoice.findMany({
    where: {
      createdById: userId,
    },

    include: invoiceInclude,

    orderBy: {
      createdAt: "desc",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, invoices, "Invoices fetched successfully!"));
});

const getInvoiceById = asyncHandler<InvoiceParams>(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = getAuthUser(req).id;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: Number(invoiceId),
      createdById: userId,
    },

    include: invoiceInclude,
  });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice fetched successfully!"));
});

const updateInvoice = asyncHandler<InvoiceParams, InvoiceBody>(
  async (req, res) => {
    const { invoiceId } = req.params;
    const userId = getAuthUser(req).id;

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
        createdById: userId,
      },
    });

    if (!existingInvoice) {
      throw new ApiError(404, "Invoice not found.");
    }

    // Validate quotation
    const quotation = await prisma.quotation.findUnique({
      where: {
        id: Number(quotationId),
        createdById: userId,
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

          create: items.map(toLineItemCreate),
        },
      },

      include: {
        ...invoiceInclude,

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
  },
);

const deleteInvoice = asyncHandler<InvoiceParams>(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = getAuthUser(req).id;

  const existingInvoice = await prisma.invoice.findUnique({
    where: {
      id: Number(invoiceId),
      createdById: userId,
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
