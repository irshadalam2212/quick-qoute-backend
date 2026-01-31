import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Invoice } from "../models/invoice.models.js";

const createInvoice = asyncHandler(async (req, res) => {
    const {
        // invoiceDate,
        clientName,
        address,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        grandTotal,
        quotationId
    } = req.body;

    if (!clientName || !address || !quotationId) {
        throw new ApiError(400, "Required field is missing!");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "At least one invoice item is required.");
    }

    const newInvoice = await Invoice.create({
        // invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        clientName,
        address,
        items,
        subtotal,
        taxRate: taxRate || 0,
        taxAmount: taxAmount || 0,
        discount: discount || 0,
        grandTotal,
        quotationId,
        createdBy: req.user._id,
        paymentStatus: "unpaid"
    });

    return res.status(201).json(
        new ApiResponse(201, newInvoice, "Invoice created successfully!")
    );
});

const getAllInvoices = asyncHandler(async (req, res) => {
    const filter = {}
    if (req.query.status) filter.status = req.query.status

    const invoices = await Invoice.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, invoices, "Invoices fetched successfully!")
    );
})

const getInvoiceById = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId)
        .populate("createdBy", "name email")
        .lean();

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice fetched successfully!")
    );
});


export {
    createInvoice,
    getAllInvoices,
    getInvoiceById
}