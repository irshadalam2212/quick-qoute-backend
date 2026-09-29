import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    createItems,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
} from "../controllers/item.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createItems);
router.route("/").get(verifyJWT, getAllItems);
router.route("/:itemId").get(verifyJWT, getItemById);
router.route("/:itemId").put(verifyJWT, updateItem);
router.route("/:itemId").delete(verifyJWT, deleteItem);

export default router;
