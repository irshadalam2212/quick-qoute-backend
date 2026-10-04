import type { ParamsDictionary } from "express-serve-static-core";
import type { PaymentBody } from "../types/api.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { paymentService } from "../services/payment.service.js";

type PaymentParams = { paymentId: string };
export const listPayments = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, await paymentService.list(getAuthUser(req).id), "Payments fetched.")));
export const createPayment = asyncHandler<ParamsDictionary, PaymentBody>(async (req, res) => res.status(201).json(new ApiResponse(201, await paymentService.create(getAuthUser(req).id, req.body), "Payment recorded.")));
export const updatePayment = asyncHandler<PaymentParams, PaymentBody>(async (req, res) => res.status(200).json(new ApiResponse(200, await paymentService.update(Number(req.params.paymentId), getAuthUser(req).id, req.body), "Payment updated.")));
export const deletePayment = asyncHandler<PaymentParams>(async (req, res) => {
  await paymentService.delete(Number(req.params.paymentId), getAuthUser(req).id);
  return res.status(200).json(new ApiResponse(200, null, "Payment deleted."));
});
