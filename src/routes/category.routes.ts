import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { requireFeature, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJWT, requireFeature("CATALOG"), createCategory)
  .get(verifyJWT, requireFeature("CATALOG"), getAllCategories);

router.route("/:categoryId")
  .get(verifyJWT, requireFeature("CATALOG"), getCategoryById)
  .put(verifyJWT, requireFeature("CATALOG"), updateCategory)
  .delete(verifyJWT, requireFeature("CATALOG"), deleteCategory);

export default router;
