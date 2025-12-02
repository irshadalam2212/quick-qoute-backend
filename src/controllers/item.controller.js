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

const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find({})
  if (!items) {
    throw new ApiError(404, "No items found.")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, items, "Items fetched successfully"));
})

const getItemById = asyncHandler(async (req, res) => {

  const { itemId } = req.params

  if (!itemId) {
    throw new ApiError(404, "Item not found")
  }

  const item = await Item.findOne({ _id: itemId })

  if (!item) {
    throw new ApiError(404, "Item not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, item, "Item fetched successfully"))
})

const updateItem = asyncHandler(async (req, res) => {

  const updates = req.body;

  const { itemId } = req.params

  if (!itemId) {
    throw new ApiError(404, `Item with ${itemId} id not found`)
  }

  const updatedItem = await Item.findByIdAndUpdate(itemId,
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true }
  )

  if (!updatedItem) {
    throw new ApiError(404, "Item not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateItem, "Item updated successfully"))
})

const deleteItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params

  if (!itemId) {
    throw new ApiError(404, "No item found.")
  }

  const deletedItem = await Item.findByIdAndDelete(itemId)

  if (!deletedItem) {
    throw new ApiError(404, "No item found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedItem, "Item deleted successfully.")
    )
})

export { createItems, getAllItems, getItemById, updateItem, deleteItem };
