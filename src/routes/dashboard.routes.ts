import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

 router.route("/metrics").get(verifyJWT, getDashboardMetrics)

export default router