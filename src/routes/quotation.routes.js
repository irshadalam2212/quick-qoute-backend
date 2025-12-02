import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import {
    createQuotation,
    getAllQuotation,
    getQuotationById,
    updateQuotation,
    deleteQuotation
} from "../controllers/quotation.controller.js"

const router = Router()

router.route("/").post(verifyJWT, createQuotation)
router.route("/").get(verifyJWT, getAllQuotation)
router.route("/:quotationId").get(verifyJWT, getQuotationById)
router.route("/:quotationId").put(verifyJWT, updateQuotation)
router.route("/:quotationId").delete(verifyJWT, deleteQuotation)

export default router