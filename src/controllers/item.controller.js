import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Item } from "../models/item.models.js";
import { ApiResponse } from "../utils/apiresponse.js";

const createItems = asyncHandler(async (req, res) => {
  const { keyword, description, category, unit, baseRate, taxRate, notes } =
    req.body;

  if (!description || !keyword || !category) {
    throw new ApiError(400, "Description, Keyword and category is required!");
  }

  const item = await Item.create({
    keyword,
    description,
    category,
    unit,
    baseRate,
    taxRate,
    notes,
    isActive: true,
    createdBy: req.user._id,
  });

  const createdItem = await Item.findById(item._id).populate(
    "createdBy",
    "name email",
  );

  if (!createdItem) {
    throw new ApiError(500, "Something went wrong while creating item");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdItem, "Item created successfully"));
});

export { createItems };
