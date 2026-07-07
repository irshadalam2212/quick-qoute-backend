import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Create Category
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;

  if (!name || !code) {
    throw new ApiError(400, "Category name and code are required.");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { code }],
    },
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists.");
  }

  const category = await prisma.category.create({
    data: {
      name,
      code: code.toUpperCase(),
      description,
      createdBy: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully."));
});

/**
 * Get All Categories
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully."));
});

/**
 * Get Category By Id
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await prisma.category.findUnique({
    where: {
      id: Number(categoryId),
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully."));
});

/**
 * Update Category
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const { name, code, description, isActive } = req.body;

  const category = await prisma.category.findUnique({
    where: {
      id: Number(categoryId),
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: Number(categoryId),
    },
    data: {
      name,
      code: code?.toUpperCase(),
      description,
      isActive,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCategory, "Category updated successfully."),
    );
});

/**
 * Delete Category
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await prisma.category.findUnique({
    where: {
      id: Number(categoryId),
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  await prisma.category.delete({
    where: {
      id: Number(categoryId),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully."));
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
