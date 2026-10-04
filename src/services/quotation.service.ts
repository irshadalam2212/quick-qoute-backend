import type { Prisma } from "@prisma/client";
import type { QuotationBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { toLineItemCreate } from "../utils/lineitems.js";
import { quotationRepository } from "../repositories/quotation.repository.js";

export const quotationService = {
  async create(userId: number, body: QuotationBody) {
    const user = await quotationRepository.findUserCompany(userId);
    if (!user) throw new ApiError(404, "User not found.");
    const companyInitials = (user.companyName ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase();
    if (!companyInitials)
      throw new ApiError(400, "Add a company name to your profile first.");

    const {
      clientName,
      projectName,
      address,
      instructions,
      quotation,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
    } = body;
    if (!address || !Array.isArray(quotation) || quotation.length === 0) {
      throw new ApiError(400, "Address and quotation items are required.");
    }
    const year = new Date().getFullYear();
    const prefix = `${companyInitials}-${year}-`;
    for (let attempt = 0; ; attempt += 1) {
      const existingNumbers = await quotationRepository.findNumbers(prefix);
      const highestSerial = existingNumbers.reduce((highest, item) => {
        const serial = Number(item.quotationNo.match(/-(\d+)$/)?.[1] ?? 0);
        return Math.max(highest, serial);
      }, 0);
      const quotationNo = `${prefix}${String(highestSerial + 1).padStart(3, "0")}`;
      const data: Prisma.QuotationCreateInput = {
        quotationNo,
        date: new Date(),
        clientName,
        projectName,
        address,
        instructions,
        subtotal,
        taxRate: taxRate || 0,
        taxAmount: taxAmount || 0,
        discount: discount || 0,
        grandTotal,
        status: "DRAFT",
        createdBy: { connect: { id: userId } },
        items: { create: quotation.map(toLineItemCreate) },
      };
      try {
        return await quotationRepository.create(data);
      } catch (error) {
        const uniqueConflict =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2002";
        if (!uniqueConflict || attempt >= 9) throw error;
      }
    }
  },
  list(userId: number) {
    return quotationRepository.findAll(userId);
  },
  async get(id: number, userId: number) {
    const quotation = await quotationRepository.findById(id, userId);
    if (!quotation) throw new ApiError(404, "Quotation not found");
    return quotation;
  },
  async update(id: number, userId: number, body: QuotationBody) {
    const {
      quotationNo,
      date,
      clientName,
      projectName,
      address,
      instructions,
      quotation,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      status,
    } = body;
    if (!Array.isArray(quotation) || quotation.length === 0) {
      throw new ApiError(400, "At least one quotation item is required.");
    }
    if (!(await quotationRepository.findOwned(id, userId)))
      throw new ApiError(404, "Quotation not found");
    return quotationRepository.update(id, {
      quotationNo,
      date: date ? new Date(date) : undefined,
      clientName,
      projectName,
      address,
      instructions,
      subtotal: Number(subtotal),
      taxRate: Number(taxRate) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: Number(discount) || 0,
      grandTotal: Number(grandTotal),
      status,
      items: { deleteMany: {}, create: quotation.map(toLineItemCreate) },
    });
  },
  async delete(id: number, userId: number) {
    if (!(await quotationRepository.findOwned(id, userId)))
      throw new ApiError(404, "Quotation not found");
    if (await quotationRepository.findInvoiceForQuotation(id, userId)) {
      throw new ApiError(
        409,
        "This quotation can't be deleted because it has one or more invoices. Delete the invoice(s) first.",
      );
    }
    await quotationRepository.delete(id);
  },
};
