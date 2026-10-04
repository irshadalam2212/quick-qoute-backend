import type { ParamsDictionary } from "express-serve-static-core";
import type { QuotationBody } from "../types/api.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { quotationService } from "../services/quotation.service.js";

type QuotationParams = { quotationId: string };

const createQuotation = asyncHandler<ParamsDictionary, QuotationBody>(
  async (req, res) => {
    const quotation = await quotationService.create(
      getAuthUser(req).id,
      req.body,
    );
    return res
      .status(201)
      .json(new ApiResponse(201, quotation, "Quotation created successfully"));
  },
);

const getAllQuotation = asyncHandler(async (req, res) => {
  const quotations = await quotationService.list(getAuthUser(req).id);
  return res
    .status(200)
    .json(new ApiResponse(200, quotations, "Quotation fetched successfully"));
});

const getQuotationById = asyncHandler<QuotationParams>(async (req, res) => {
  const quotation = await quotationService.get(
    Number(req.params.quotationId),
    getAuthUser(req).id,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched successfully"));
});

const updateQuotation = asyncHandler<QuotationParams, QuotationBody>(
  async (req, res) => {
    const quotation = await quotationService.update(
      Number(req.params.quotationId),
      getAuthUser(req).id,
      req.body,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, quotation, "Quotation updated successfully"));
  },
);

const deleteQuotation = asyncHandler<QuotationParams>(async (req, res) => {
  await quotationService.delete(
    Number(req.params.quotationId),
    getAuthUser(req).id,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Quotation deleted successfully"));
});

export {
  createQuotation,
  getAllQuotation,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};
