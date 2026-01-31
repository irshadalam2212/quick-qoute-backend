import mongoose, { Schema } from "mongoose";
import { Counter } from "./counter.models.js"

const invoiceItemSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    unit: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false })

const invoiceSchema = new Schema({
    invoiceNo: {
        type: Number,
        unique: true,
        index: true
    },
    // invoiceDate: {
    //     type: Date,
    //     default: Date.now
    // },
    clientName: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    items: {
        type: [invoiceItemSchema],
        required: true,
        default: [],
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 0,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    grandTotal: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid',
    },
    quotationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });


invoiceSchema.pre("save", async function () {
    if (!this.isNew) return;

    const counter = await Counter.findOneAndUpdate(
        { name: "invoice" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    this.invoiceNo = counter.seq;
});


export const Invoice = mongoose.model('Invoice', invoiceSchema);