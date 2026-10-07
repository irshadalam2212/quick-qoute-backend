import type { Prisma } from "@prisma/client";
import type { ItemBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { itemRepository } from "../repositories/item.repository.js";

const toOptionalNumber = (value: unknown): number | undefined =>
  value === undefined ? undefined : Number(value);

export const itemService = {
  create(userId: number, body: ItemBody) {
    const { description, categoryId, unitId, baseRate, taxRate, notes } = body;
    const data: Prisma.ItemCreateInput = {
      description,
      category: { connect: { id: Number(categoryId) } },
      unit: { connect: { id: Number(unitId) } },
      baseRate: Number(baseRate),
      taxRate: Number(taxRate) || 0,
      notes,
      isActive: true,
      createdBy: { connect: { id: userId } },
    };
    return itemRepository.create(data);
  },

  list() {
    return itemRepository.findAll();
  },

  async get(id: number) {
    const item = await itemRepository.findById(id);
    if (!item) throw new ApiError(404, "Item not found");
    return item;
  },

  async update(id: number, userId: number, body: Partial<ItemBody>) {
    const existing = await itemRepository.findOwned(id, userId);
    if (!existing) throw new ApiError(404, "Item not found");
    const { description, categoryId, unitId, baseRate, taxRate, notes } = body;
    return itemRepository.update(id, {
      description,
      categoryId: toOptionalNumber(categoryId),
      unitId: toOptionalNumber(unitId),
      baseRate: toOptionalNumber(baseRate),
      taxRate: toOptionalNumber(taxRate),
      notes,
    });
  },
  async delete(id: number, userId: number) {
    const existing = await itemRepository.findOwned(id, userId);
    if (!existing) throw new ApiError(404, "Item not found");
    await itemRepository.delete(id);
  },
};
