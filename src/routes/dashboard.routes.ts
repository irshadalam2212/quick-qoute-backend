import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboard.controller.js";
import { requireFeature, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

 router.route("/metrics").get(verifyJWT, requireFeature("DASHBOARD"), getDashboardMetrics)

export default router
