import { Router } from "express";
import { generateDescription } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/generate-description", verifyJWT, generateDescription);

export default router;
