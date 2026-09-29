import type { LineItemInput } from "../types/api.js";

/**
 * Maps a request line item to the nested-create shape shared by
 * QuotationItem and InvoiceItem.
 */
export const toLineItemCreate = (item: LineItemInput) => ({
  description: item.description,

  unit: {
    connect: {
      id: Number(item.unitId),
    },
  },

  quantity: Number(item.quantity),
  price: Number(item.price),
  taxRate: Number(item.taxRate) || 0,
  total: Number(item.total),
});
