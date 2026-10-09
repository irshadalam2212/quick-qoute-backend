import type { ParamsDictionary } from "express-serve-static-core";
import type { PaymentBody } from "../types/api.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { paymentService } from "../services/payment.service.js";

type PaymentParams = { paymentId: string };

const listPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.list(getAuthUser(req).id);
  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments fetched."));
});

const createPayment = asyncHandler<ParamsDictionary, PaymentBody>(
  async (req, res) => {
    await paymentService.create(getAuthUser(req).id, req.body);
    return res.status(201).json(new ApiResponse(201, [], "Payment recorded."));
  },
);

const updatePayment = asyncHandler<PaymentParams, PaymentBody>(
  async (req, res) => {
    await paymentService.update(
      Number(req.params.paymentId),
      getAuthUser(req).id,
      req.body,
    );
    return res.status(200).json(new ApiResponse(200, [], "Payment updated."));
  },
);

const deletePayment = asyncHandler<PaymentParams>(async (req, res) => {
  await paymentService.delete(
    Number(req.params.paymentId),
    getAuthUser(req).id,
  );
  return res.status(200).json(new ApiResponse(200, null, "Payment deleted."));
});

export { listPayments, createPayment, updatePayment, deletePayment };
