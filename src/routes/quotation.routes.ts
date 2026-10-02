import { Router } from "express"
import { requireFeature, verifyJWT } from "../middleware/auth.middleware.js"
import {
    createQuotation,
    getAllQuotation,
    getQuotationById,
    updateQuotation,
    deleteQuotation
} from "../controllers/quotation.controller.js"

const router = Router()

router.route("/").post(verifyJWT, requireFeature("QUOTATIONS"), createQuotation)
router.route("/").get(verifyJWT, requireFeature("QUOTATIONS"), getAllQuotation)
router.route("/:quotationId").get(verifyJWT, requireFeature("QUOTATIONS"), getQuotationById)
router.route("/:quotationId").put(verifyJWT, requireFeature("QUOTATIONS"), updateQuotation)
router.route("/:quotationId").delete(verifyJWT, requireFeature("QUOTATIONS"), deleteQuotation)

export default router
