import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.route("/")
  .post(createCategory)
  .get(getAllCategories);

router.route("/:categoryId")
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;