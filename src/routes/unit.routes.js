import { Router } from "express";
import {
    getAllUnits
} from "../controllers/unitofmeasure.controller.js";

const router = Router();

router.route("/").get(getAllUnits);

export default router;