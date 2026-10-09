import type { ParamsDictionary } from "express-serve-static-core";
import type { CreateCategoryBody, UpdateCategoryBody } from "../types/api.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { categoryService } from "../services/category.service.js";

type CategoryParams = { categoryId: string };

const createCategory = asyncHandler<ParamsDictionary, CreateCategoryBody>(
  async (req, res) => {
    await categoryService.create(getAuthUser(req).id, req.body);
    return res.status(201).json(new ApiResponse(201, [], "Category created"));
  },
);

const getAllCategories = asyncHandler(async (_req, res) => {
  const categories = await categoryService.list();
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched"));
});

const getCategoryById = asyncHandler<CategoryParams>(async (req, res) => {
  const category = await categoryService.get(Number(req.params.categoryId));
  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched"));
});

const updateCategory = asyncHandler<CategoryParams, UpdateCategoryBody>(
  async (req, res) => {
    await categoryService.update(Number(req.params.categoryId), req.body);
    return res.status(200).json(new ApiResponse(200, [], "Category updated"));
  },
);

const deleteCategory = asyncHandler<CategoryParams>(async (req, res) => {
  await categoryService.delete(Number(req.params.categoryId));
  return res.status(200).json(new ApiResponse(200, null, "Category deleted"));
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
