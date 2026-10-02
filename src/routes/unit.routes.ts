import { Router } from "express";
import {
    getAllUnits
} from "../controllers/unitofmeasure.controller.js";
import { requireFeature, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, requireFeature("CATALOG"), getAllUnits);

export default router;
