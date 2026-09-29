import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJWT, createCategory)
  .get(getAllCategories);

router.route("/:categoryId")
  .get(getCategoryById)
  .put(verifyJWT, updateCategory)
  .delete(verifyJWT, deleteCategory);

export default router;
