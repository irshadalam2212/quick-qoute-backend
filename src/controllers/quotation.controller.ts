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
      companyName: true,
      mobileNumber: true,
      alternateMobile: true,
      website: true,
      gstNumber: true,
      panNumber: true,
      services: true,
      address: true,
      logo: true,
      signature: true,
    },
  },
  items: {
    include: { unit: { select: { id: true, name: true, shortName: true } } },
  },
} satisfies Prisma.QuotationInclude;

const createQuotation = asyncHandler<ParamsDictionary, QuotationBody>(
  async (req, res) => {
    const authUser = getAuthUser(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { companyName: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const companyInitials = (user.companyName ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase();

    if (!companyInitials) {
      throw new ApiError(400, "Add a company name to your profile first.");
    }

    const year = new Date().getFullYear();
    const quotationPrefix = `${companyInitials}-${year}-`;

    const {
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
      !address ||
      !Array.isArray(quotation) ||
      quotation.length === 0
    ) {
      throw new ApiError(
        400,
        "Address and quotation items are required.",
      );
    }

    let newQuotation: Awaited<ReturnType<typeof prisma.quotation.create>>;
    for (let attempt = 0; ; attempt += 1) {
      const existingNumbers = await prisma.quotation.findMany({
        where: { quotationNo: { startsWith: quotationPrefix } },
        select: { quotationNo: true },
      });
      const highestSerial = existingNumbers.reduce((highest, item) => {
        const serial = Number(item.quotationNo.match(/-(\d+)$/)?.[1] ?? 0);
        return Math.max(highest, serial);
      }, 0);
      const nextSerial = highestSerial + 1;
      const quotationNo = `${quotationPrefix}${String(nextSerial).padStart(3, "0")}`;

      try {
        newQuotation = await prisma.quotation.create({
          data: {
            quotationNo,
            date: new Date(),
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
        break;
      } catch (error) {
        const isUniqueConflict =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2002";
        if (!isUniqueConflict || attempt >= 9) {
          throw error;
        }
      }
    }

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
