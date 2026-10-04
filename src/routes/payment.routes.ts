import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createPayment, deletePayment, listPayments, updatePayment } from "../controllers/payment.controller.js";

const router = Router();
router.use(verifyJWT);
router.route("/").get(listPayments).post(createPayment);
router.route("/:paymentId").put(updatePayment).delete(deletePayment);
export default router;
