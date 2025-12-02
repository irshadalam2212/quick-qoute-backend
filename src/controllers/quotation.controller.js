import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Quotation } from "../models/quotation.models.js";

const createQuotation = asyncHandler(async (req, res) => {
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
        grandTotal
    } = req.body;

    if (!quotationNo || !address || !Array.isArray(quotation) || quotation?.length === 0) {
        throw new ApiError(400, "Quotation number, address, quotation items are required.")
    }

    const existingQuotation = await Quotation.findOne({ quotationNo });

    if (existingQuotation) {
        throw new ApiError(400, "Quotation number must be unique.")
    }

    const newQuotation = await Quotation.create({
        quotationNo,
        date: date ? new Date(date) : new Date(),
        clientName,
        projectName,
        address,
        instructions,
        quotation,
        subtotal,
        taxRate: taxRate || 0,
        taxAmount: taxAmount || 0,
        discount: discount || 0,
        grandTotal,
        createdBy: req.user._id,
        status: "draft"
    })

    if (!newQuotation) {
        throw new ApiError(500, "Something went wrong while creating quotation.")
    }

    return res
        .status(201)
        .json(new ApiResponse(200, newQuotation, "Quotation created successfully"))
})

const getAllQuotation = asyncHandler(async (req, res) => {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.clientName) filter.clientName = new RegExp(req.query.clientName, "i");


    const quotations = await Quotation.find(filter)
        .populate("createdBy", 'name email')
        .sort({ createdAt: -1 })

    if (!quotations) {
        throw new ApiError(404, "No quotations found.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, quotations, "Quotation fetched successfully."))
})

const getQuotationById = asyncHandler(async (req, res) => {

    const { quotationId } = req.params

    if (!quotationId) {
        throw new ApiError(404, `Quotation with ${quotationId} id is not found.`)
    }

    const quotation = await Quotation.findById(quotationId)
        .populate("createdBy", "name email")

    if (!quotation) {
        throw new ApiError(404, `Quotation not found.`)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, quotation, "Quotation fetched successfully"))
})

const updateQuotation = asyncHandler(async (req, res) => {

    const updates = req.body;

    const { quotationId } = req.params

    if (!quotationId) {
        throw new ApiError(404, "Quotation id not found")
    }

    const updatedQuotation = await Quotation.findByIdAndUpdate(quotationId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
    )

    if (!updatedQuotation) {
        throw new ApiError(404, "Quotation not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedQuotation, "Quotation updated successfully"))
})

const deleteQuotation = asyncHandler(async (req, res) => {
    
    const { quotationId } = req.params;

    if (!quotationId) {
        throw new ApiError(404, "No quotation found.")
    }

    const deletedQuotation = await Quotation.findByIdAndDelete(quotationId)

    if (!deletedQuotation) {
        throw new ApiError(404, "No quotation found.");
    }

    return res.status(200).json(new ApiResponse(200, deletedQuotation, "Quotation deleted successfully."))
})

export { createQuotation, getAllQuotation, getQuotationById, updateQuotation, deleteQuotation }