import mongoose, { Schema } from "mongoose";

const quotationItemSchema = new Schema({
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

const quotationSchema = new Schema(
    {
        quotationNo: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        clientName: {
            type: String,
            trim: true
        },
        projectName: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        instructions: {
            type: String,
            trim: true
        },

        quotation: { type: [quotationItemSchema], required: true },

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
        status: {
            type: String,
            enum: ['draft', 'submitted', 'approved', 'rejected'],
            default: 'draft'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }, { timestamps: true }
)

export const Quotation = mongoose.model("Quotation", quotationSchema);