import { Router } from "express";
import { generateDescription } from "../controllers/ai.controller.js";
import { requireFeature, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/generate-description", verifyJWT, requireFeature("AI"), generateDescription);

export default router;
