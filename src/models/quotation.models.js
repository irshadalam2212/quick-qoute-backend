import mongoose, { Schema } from "mongoose";

const quotationSchema = new Schema(
    {
        quotationNo: {
            type: String,
            required: true,
            index: true,
            trim: true
        }
    }

)

export const Quotation = mongoose.model("Quotation", quotationSchema);