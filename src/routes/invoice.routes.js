import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    createInvoice,
    getAllInvoices,
    getInvoiceById
 } from "../controllers/invoice.controller.js";

 const router = Router()

 router.route("/").post(verifyJWT, createInvoice)
 router.route("/").get(verifyJWT, getAllInvoices)
 router.route("/:invoiceId").get(verifyJWT, getInvoiceById)

 export default router