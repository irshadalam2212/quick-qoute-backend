import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    // keyword: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   index: true,
    //   lowercase: true,
    // },
    category: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      trim: true,
    },
    baseRate: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
    },
    description: {
      type: String,
      required: true
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Item = mongoose.model("Item", itemSchema);
