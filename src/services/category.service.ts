import type { CreateCategoryBody, UpdateCategoryBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { categoryRepository } from "../repositories/category.repository.js";

export const categoryService = {
  async create(userId: number, body: CreateCategoryBody) {
    const { name, code, description } = body;
    if (!name || !code)
      throw new ApiError(400, "Category name and code are required.");
    if (await categoryRepository.findDuplicate(name, code)) {
      throw new ApiError(409, "Category already exists.");
    }
    return categoryRepository.create({
      name,
      code: code.toUpperCase(),
      description,
      createdById: userId,
    });
  },
  list() {
    return categoryRepository.findAll();
  },
  async get(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new ApiError(404, "Category not found.");
    return category;
  },
  async update(id: number, body: UpdateCategoryBody) {
    await this.get(id);
    const { name, code, description, isActive } = body;
    return categoryRepository.update(id, {
      name,
      code: code?.toUpperCase(),
      description,
      isActive,
    });
  },
  async delete(id: number) {
    await this.get(id);
    await categoryRepository.delete(id);
  },
};
