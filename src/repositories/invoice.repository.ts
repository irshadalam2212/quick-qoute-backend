import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

export const invoiceInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      mobileNumber: true,
      alternateMobile: true,
      website: true,
      gstNumber: true,
      panNumber: true,
      services: true,
      address: true,
      logo: true,
      signature: true,
    },
  },
  quotation: { select: { id: true, quotationNo: true } },
  items: {
    include: { unit: { select: { id: true, name: true, shortName: true } } },
  },
  payments: { orderBy: { date: "desc" as const } },
} satisfies Prisma.InvoiceInclude;

export const invoiceRepository = {
  findQuotation(id: number, userId: number) {
    return prisma.quotation.findUnique({
      where: { id, createdById: userId },
      select: { id: true },
    });
  },
  create(data: Prisma.InvoiceCreateInput) {
    return prisma.invoice.create({ data, include: invoiceInclude });
  },
  findAll(userId: number) {
    return prisma.invoice.findMany({
      where: { createdById: userId },
      include: invoiceInclude,
      orderBy: { createdAt: "desc" },
    });
  },
  findById(id: number, userId: number) {
    return prisma.invoice.findUnique({
      where: { id, createdById: userId },
      include: invoiceInclude,
    });
  },
  findOwned(id: number, userId: number) {
    return prisma.invoice.findUnique({ where: { id, createdById: userId } });
  },
  update(id: number, data: Prisma.InvoiceUpdateInput) {
    return prisma.invoice.update({
      where: { id },
      data,
      include: invoiceInclude,
    });
  },
  delete(id: number) {
    return prisma.invoice.delete({ where: { id } });
  },
};
