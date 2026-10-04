import type { ParamsDictionary } from "express-serve-static-core";
import type { InvoiceBody } from "../types/api.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { invoiceService } from "../services/invoice.service.js";

type InvoiceParams = { invoiceId: string };

const createInvoice = asyncHandler<ParamsDictionary, InvoiceBody>(
  async (req, res) => {
    const invoice = await invoiceService.create(getAuthUser(req).id, req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, invoice, "Invoice created successfully!"));
  },
);

const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await invoiceService.list(getAuthUser(req).id);
  return res
    .status(200)
    .json(new ApiResponse(200, invoices, "Invoices fetched successfully!"));
});

const getInvoiceById = asyncHandler<InvoiceParams>(async (req, res) => {
  const invoice = await invoiceService.get(
    Number(req.params.invoiceId),
    getAuthUser(req).id,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice fetched successfully!"));
});

const updateInvoice = asyncHandler<InvoiceParams, InvoiceBody>(
  async (req, res) => {
    const invoice = await invoiceService.update(
      Number(req.params.invoiceId),
      getAuthUser(req).id,
      req.body,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, invoice, "Invoice updated successfully."));
  },
);

const deleteInvoice = asyncHandler<InvoiceParams>(async (req, res) => {
  await invoiceService.delete(
    Number(req.params.invoiceId),
    getAuthUser(req).id,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Invoice deleted successfully."));
});

export {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
