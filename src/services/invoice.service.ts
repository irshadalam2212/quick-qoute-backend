import type { Prisma } from "@prisma/client";
import type { InvoiceBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { toLineItemCreate } from "../utils/lineitems.js";
import { invoiceRepository } from "../repositories/invoice.repository.js";

export const invoiceService = {
  async create(userId: number, body: InvoiceBody) {
    const {
      clientName,
      address,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      quotationId,
    } = body;
    if (!clientName || !address || !quotationId)
      throw new ApiError(400, "Required fields are missing.");
    if (!Array.isArray(items) || items.length === 0)
      throw new ApiError(400, "At least one invoice item is required.");
    if (!(await invoiceRepository.findQuotation(Number(quotationId), userId)))
      throw new ApiError(404, "Quotation not found.");
    const data: Prisma.InvoiceCreateInput = {
      clientName,
      address,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount: taxAmount || 0,
      discount: discount || 0,
      grandTotal,
      paymentStatus: "UNPAID",
      quotation: { connect: { id: Number(quotationId) } },
      createdBy: { connect: { id: userId } },
      items: { create: items.map(toLineItemCreate) },
    };
    return invoiceRepository.create(data);
  },
  list(userId: number) {
    return invoiceRepository.findAll(userId);
  },
  async get(id: number, userId: number) {
    const invoice = await invoiceRepository.findById(id, userId);
    if (!invoice) throw new ApiError(404, "Invoice not found");
    return invoice;
  },
  async update(id: number, userId: number, body: InvoiceBody) {
    const {
      clientName,
      address,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      paymentStatus,
      quotationId,
    } = body;
    if (!Array.isArray(items) || items.length === 0)
      throw new ApiError(400, "At least one invoice item is required.");
    if (!(await invoiceRepository.findOwned(id, userId)))
      throw new ApiError(404, "Invoice not found.");
    if (!(await invoiceRepository.findQuotation(Number(quotationId), userId)))
      throw new ApiError(404, "Quotation not found.");
    return invoiceRepository.update(id, {
      clientName,
      address,
      subtotal: Number(subtotal),
      taxRate: Number(taxRate) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: Number(discount) || 0,
      grandTotal: Number(grandTotal),
      paymentStatus,
      quotation: { connect: { id: Number(quotationId) } },
      items: { deleteMany: {}, create: items.map(toLineItemCreate) },
    });
  },
  async delete(id: number, userId: number) {
    const invoice = await invoiceRepository.findOwned(id, userId);
    if (!invoice) throw new ApiError(404, "Invoice not found.");
    await invoiceRepository.delete(id);
  },
};
