import type { ParamsDictionary } from "express-serve-static-core";
import type { Prisma } from "@prisma/client";
import type { QuotationBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { toLineItemCreate } from "../utils/lineitems.js";
import prisma from "../lib/prisma.js";

type QuotationParams = { quotationId: string };

const quotationInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: true,
} satisfies Prisma.QuotationInclude;

const createQuotation = asyncHandler<ParamsDictionary, QuotationBody>(
  async (req, res) => {
    const authUser = getAuthUser(req);

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
            id: authUser.id,
          },
        },

        items: {
          create: quotation.map(toLineItemCreate),
        },
      },

      include: quotationInclude,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, newQuotation, "Quotation created successfully"),
      );
  },
);

const getAllQuotation = asyncHandler(async (req, res) => {
  const userId = getAuthUser(req).id;

  const where: Prisma.QuotationWhereInput = {
    createdById: userId,
  };

  const quotations = await prisma.quotation.findMany({
    where,
    include: quotationInclude,

    orderBy: {
      createdAt: "desc",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, quotations, "Quotation fetched successfully"));
});

const getQuotationById = asyncHandler<QuotationParams>(async (req, res) => {
  const { quotationId } = req.params;
  const userId = getAuthUser(req).id;

  const quotation = await prisma.quotation.findUnique({
    where: {
      id: Number(quotationId),
      createdById: userId,
    },

    include: quotationInclude,
  });

  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched successfully"));
});

const updateQuotation = asyncHandler<QuotationParams, QuotationBody>(
  async (req, res) => {
    const { quotationId } = req.params;
    const userId = getAuthUser(req).id;

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

    if (!Array.isArray(quotation) || quotation.length === 0) {
      throw new ApiError(400, "At least one quotation item is required.");
    }

    const existingQuotation = await prisma.quotation.findUnique({
      where: {
        id: Number(quotationId),
        createdById: userId,
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

        subtotal: Number(subtotal),
        taxRate: Number(taxRate) || 0,
        taxAmount: Number(taxAmount) || 0,
        discount: Number(discount) || 0,
        grandTotal: Number(grandTotal),

        status,

        items: {
          deleteMany: {},

          create: quotation.map(toLineItemCreate),
        },
      },

      include: quotationInclude,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedQuotation,
          "Quotation updated successfully",
        ),
      );
  },
);

const deleteQuotation = asyncHandler<QuotationParams>(async (req, res) => {
  const { quotationId } = req.params;
  const userId = getAuthUser(req).id;

  const quotation = await prisma.quotation.findUnique({
    where: {
      id: Number(quotationId),
      createdById: userId,
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
