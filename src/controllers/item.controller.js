import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import prisma from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiresponse.js";

const createItems = asyncHandler(async (req, res) => {
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
          id: req.user.id,
        },
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
      category: true,
      unit: true,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, item, "Item created successfully"));
});

const getAllItems = asyncHandler(async (req, res) => {
  const items = await prisma.item.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "Items fetched successfully"));
});

const getItemById = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await prisma.item.findUnique({
    where: {
      id: Number(itemId),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item fetched successfully"));
});

const updateItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const { description, category, unit, baseRate, taxRate, notes, isActive } =
    req.body;

  const existingItem = await prisma.item.findUnique({
    where: {
      id: Number(itemId),
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
      category,
      unit,
      baseRate,
      taxRate,
      notes,
      isActive,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedItem, "Item updated successfully"));
});

const deleteItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const existingItem = await prisma.item.findUnique({
    where: {
      id: Number(itemId),
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
