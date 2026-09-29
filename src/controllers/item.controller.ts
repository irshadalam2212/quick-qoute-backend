import type { ParamsDictionary } from "express-serve-static-core";
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import type { ItemBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";

type ItemParams = { itemId: string };

const createdBySelect = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ItemInclude;

const toOptionalNumber = (value: unknown): number | undefined =>
  value === undefined ? undefined : Number(value);

const createItems = asyncHandler<ParamsDictionary, ItemBody>(
  async (req, res) => {
    const authUser = getAuthUser(req);

    const { description, categoryId, unitId, baseRate, taxRate, notes } =
      req.body;

    const item = await prisma.item.create({
      data: {
        description,

        category: {
          connect: {
            id: Number(categoryId),
          },
        },

        unit: {
          connect: {
            id: Number(unitId),
          },
        },

        baseRate: Number(baseRate),
        taxRate: Number(taxRate) || 0,
        notes,
        isActive: true,

        createdBy: {
          connect: {
            id: authUser.id,
          },
        },
      },

      include: {
        ...createdBySelect,
        category: true,
        unit: true,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, item, "Item created successfully"));
  },
);

const getAllItems = asyncHandler(async (_req, res) => {
  const items = await prisma.item.findMany({
    include: createdBySelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "Items fetched successfully"));
});

const getItemById = asyncHandler<ItemParams>(async (req, res) => {
  const { itemId } = req.params;

  const item = await prisma.item.findUnique({
    where: {
      id: Number(itemId),
    },
    include: createdBySelect,
  });

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item fetched successfully"));
});

const updateItem = asyncHandler<ItemParams, Partial<ItemBody>>(
  async (req, res) => {
    const { itemId } = req.params;
    const userId = getAuthUser(req).id;

    const { description, categoryId, unitId, baseRate, taxRate, notes } =
      req.body;

    const existingItem = await prisma.item.findUnique({
      where: {
        id: Number(itemId),
        createdById: userId,
      },
    });

    if (!existingItem) {
      throw new ApiError(404, "Item not found");
    }

    const updatedItem = await prisma.item.update({
      where: {
        id: Number(itemId),
      },
      data: {
        description,
        categoryId: toOptionalNumber(categoryId),
        unitId: toOptionalNumber(unitId),
        baseRate: toOptionalNumber(baseRate),
        taxRate: toOptionalNumber(taxRate),
        notes,
      },
      include: createdBySelect,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedItem, "Item updated successfully"));
  },
);

const deleteItem = asyncHandler<ItemParams>(async (req, res) => {
  const { itemId } = req.params;
  const userId = getAuthUser(req).id;

  const existingItem = await prisma.item.findUnique({
    where: {
      id: Number(itemId),
      createdById: userId,
    },
  });

  if (!existingItem) {
    throw new ApiError(404, "Item not found");
  }

  await prisma.item.delete({
    where: {
      id: Number(itemId),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Item deleted successfully"));
});

export { createItems, getAllItems, getItemById, updateItem, deleteItem };
