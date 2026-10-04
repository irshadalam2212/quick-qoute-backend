import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

export const createdBySelect = {
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ItemInclude;

export const itemRepository = {
  create(data: Prisma.ItemCreateInput) {
    return prisma.item.create({
      data,
      include: { ...createdBySelect, category: true, unit: true },
    });
  },
  findAll() {
    return prisma.item.findMany({
      include: createdBySelect,
      orderBy: { createdAt: "desc" },
    });
  },
  findById(id: number) {
    return prisma.item.findUnique({ where: { id }, include: createdBySelect });
  },
  findOwned(id: number, createdById: number) {
    return prisma.item.findUnique({ where: { id, createdById } });
  },
  update(id: number, data: Prisma.ItemUncheckedUpdateInput) {
    return prisma.item.update({
      where: { id },
      data,
      include: createdBySelect,
    });
  },
  delete(id: number) {
    return prisma.item.delete({ where: { id } });
  },
};
