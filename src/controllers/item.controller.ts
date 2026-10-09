import type { ParamsDictionary } from "express-serve-static-core";
import type { ItemBody } from "../types/api.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { getAuthUser } from "../utils/auth.js";
import { itemService } from "../services/item.service.js";

type ItemParams = { itemId: string };

const createItems = asyncHandler<ParamsDictionary, ItemBody>(
  async (req, res) => {
    await itemService.create(getAuthUser(req).id, req.body);
    return res.status(201).json(new ApiResponse(201, [], "Item created"));
  },
);

const getAllItems = asyncHandler(async (_req, res) => {
  const items = await itemService.list();
  return res.status(200).json(new ApiResponse(200, items, "Items fetched"));
});

const getItemById = asyncHandler<ItemParams>(async (req, res) => {
  const item = await itemService.get(Number(req.params.itemId));
  return res.status(200).json(new ApiResponse(200, item, "Item fetched"));
});

const updateItem = asyncHandler<ItemParams, Partial<ItemBody>>(
  async (req, res) => {
    // const item = await itemService.update(
    //   Number(req.params.itemId),
    //   getAuthUser(req).id,
    //   req.body,
    // );
    return res.status(200).json(new ApiResponse(200, [], "Item updated"));
  },
);

const deleteItem = asyncHandler<ItemParams>(async (req, res) => {
  await itemService.delete(Number(req.params.itemId), getAuthUser(req).id);
  return res.status(200).json(new ApiResponse(200, {}, "Item deleted"));
});

export { createItems, getAllItems, getItemById, updateItem, deleteItem };
