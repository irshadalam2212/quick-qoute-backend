import { Router } from "express";
import { requireFeature, verifyJWT } from "../middleware/auth.middleware.js";
import {
    createItems,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
} from "../controllers/item.controller.js";

const router = Router();

router.route("/").post(verifyJWT, requireFeature("CATALOG"), createItems);
router.route("/").get(verifyJWT, requireFeature("CATALOG"), getAllItems);
router.route("/:itemId").get(verifyJWT, requireFeature("CATALOG"), getItemById);
router.route("/:itemId").put(verifyJWT, requireFeature("CATALOG"), updateItem);
router.route("/:itemId").delete(verifyJWT, requireFeature("CATALOG"), deleteItem);

export default router;
