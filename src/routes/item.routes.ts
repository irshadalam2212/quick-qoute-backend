import { Router } from "express";
import { requireAdmin, verifyJWT } from "../middleware/auth.middleware.js";
import {
    createItems,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
} from "../controllers/item.controller.js";

const router = Router();

router.route("/").post(verifyJWT, requireAdmin, createItems);
router.route("/").get(verifyJWT, getAllItems);
router.route("/:itemId").get(verifyJWT, getItemById);
router.route("/:itemId").put(verifyJWT, requireAdmin, updateItem);
router.route("/:itemId").delete(verifyJWT, requireAdmin, deleteItem);

export default router;
