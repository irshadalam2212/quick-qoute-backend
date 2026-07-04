import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import prisma from "../lib/prisma.js";

const createQuotation = asyncHandler(async (req, res) => {
  const {
    quotationNo,
    date,
    clientName,
    projectName,
    address,
    instructions,
    quotation,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    grandTotal,
  } = req.body;

  if (
    !quotationNo ||
    !address ||
    !Array.isArray(quotation) ||
    quotation.length === 0
  ) {
    throw new ApiError(
      400,
      "Quotation number, address and quotation items are required.",
    );
  }

  const existingQuotation = await prisma.quotation.findUnique({
    where: {
      quotationNo,
    },
  });

  if (existingQuotation) {
    throw new ApiError(409, "Quotation number already exists.");
  }

  const newQuotation = await prisma.quotation.create({
    data: {
      quotationNo,
      date: date ? new Date(date) : new Date(),
      clientName,
      projectName,
      address,
      instructions,

      subtotal,
      taxRate: taxRate || 0,
      taxAmount: taxAmount || 0,
      discount: discount || 0,
      grandTotal,

      status: "DRAFT",

      createdBy: {
        connect: {
          id: req.user.id,
        },
      },

      items: {
        create: quotation.map((item) => ({
          description: item.description,
          unitId: Number(item.unit),
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
      items: true,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newQuotation, "Quotation created successfully"));
});

const getAllQuotation = asyncHandler(async (req, res) => {
  const where = {};

  if (req.query.status) {
    where.status = req.query.status.toUpperCase();
  }

  if (req.query.clientName) {
    where.clientName = {
      contains: req.query.clientName,
      mode: "insensitive",
    };
  }

  const quotations = await prisma.quotation.findMany({
    where,

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
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
    .json(new ApiResponse(200, quotations, "Quotation fetched successfully"));
});

const getQuotationById = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const quotation = await prisma.quotation.findUnique({
    where: {
      id: Number(quotationId),
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: true,
    },
  });

  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched successfully"));
});

const updateQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const {
    quotationNo,
    date,
    clientName,
    projectName,
    address,
    instructions,
    quotation,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    grandTotal,
    status,
  } = req.body;

  const existingQuotation = await prisma.quotation.findUnique({
    where: {
      id: Number(quotationId),
    },
  });

  if (!existingQuotation) {
    throw new ApiError(404, "Quotation not found");
  }

  const updatedQuotation = await prisma.quotation.update({
    where: {
      id: Number(quotationId),
    },

    data: {
      quotationNo,
      date: date ? new Date(date) : undefined,
      clientName,
      projectName,
      address,
      instructions,

      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,

      status,

      items: {
        deleteMany: {},

        create: quotation.map((item) => ({
          description: item.description,
          unitId: Number(item.unit),
          quantity: Number(item.quantity),
          price: Number(item.price),
          taxRate: Number(item.taxRate),
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
      items: true,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedQuotation, "Quotation updated successfully"),
    );
});

const deleteQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const quotation = await prisma.quotation.findUnique({
    where: {
      id: Number(quotationId),
    },
  });

  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  await prisma.quotation.delete({
    where: {
      id: Number(quotationId),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Quotation deleted successfully"));
});

export {
  createQuotation,
  getAllQuotation,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};
