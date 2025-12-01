import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createItems } from "../controllers/item.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createItems);

export default router;
