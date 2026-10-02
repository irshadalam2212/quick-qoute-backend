import { Router } from "express";
import { requireFeature, verifyJWT } from "../middleware/auth.middleware.js";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
} from "../controllers/invoice.controller.js";

const router = Router();

router.route("/").post(verifyJWT, requireFeature("INVOICES"), createInvoice);
router.route("/").get(verifyJWT, requireFeature("INVOICES"), getAllInvoices);
router.route("/:invoiceId").get(verifyJWT, requireFeature("INVOICES"), getInvoiceById);
router.route("/:invoiceId").put(verifyJWT, requireFeature("INVOICES"), updateInvoice);
router.route("/:invoiceId").delete(verifyJWT, requireFeature("INVOICES"), deleteInvoice);

export default router;
