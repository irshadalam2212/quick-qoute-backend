import type { PaymentBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { paymentRepository } from "../repositories/payment.repository.js";

function parse(body: PaymentBody) {
  const invoiceId = Number(body.invoiceId);
  const amount = Math.round(Number(body.amount) * 100) / 100;
  const date = new Date(body.date);
  const method = body.method?.trim();
  if (!Number.isInteger(invoiceId) || invoiceId <= 0 || !Number.isFinite(amount) || amount <= 0 || !method || !Number.isFinite(date.getTime()))
    throw new ApiError(400, "Invoice, a positive amount, payment date and method are required.");
  return { invoiceId, amount, date, method, reference: body.reference?.trim() || null, notes: body.notes?.trim() || null };
}

function translate(error: unknown): never {
  if (error instanceof Error && error.message === "PAYMENT_EXCEEDS_BALANCE") throw new ApiError(400, "Payment amount exceeds the remaining invoice balance.");
  throw error;
}

export const paymentService = {
  list(userId: number) { return paymentRepository.list(userId); },
  async create(userId: number, body: PaymentBody) {
    try {
      const result = await paymentRepository.create(userId, parse(body));
      if (!result) throw new ApiError(404, "Invoice not found.");
      return result;
    } catch (error) { return translate(error); }
  },
  async update(id: number, userId: number, body: PaymentBody) {
    if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Invalid payment ID.");
    try {
      const result = await paymentRepository.update(id, userId, parse(body));
      if (!result) throw new ApiError(404, "Payment or invoice not found.");
      return result;
    } catch (error) { return translate(error); }
  },
  async delete(id: number, userId: number) {
    if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Invalid payment ID.");
    if (!(await paymentRepository.delete(id, userId))) throw new ApiError(404, "Payment not found.");
  },
};
