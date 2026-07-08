import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
} from "../controllers/invoice.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createInvoice);
router.route("/").get(verifyJWT, getAllInvoices);
router.route("/:invoiceId").get(verifyJWT, getInvoiceById);
router.route("/:invoiceId").put(verifyJWT, updateInvoice);
router.route("/:invoiceId").delete(verifyJWT, deleteInvoice);

export default router;
