import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

export const quotationInclude = {
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
  items: {
    include: { unit: { select: { id: true, name: true, shortName: true } } },
  },
} satisfies Prisma.QuotationInclude;

export const quotationRepository = {
  findUserCompany(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { companyName: true },
    });
  },
  findNumbers(prefix: string) {
    return prisma.quotation.findMany({
      where: { quotationNo: { startsWith: prefix } },
      select: { quotationNo: true },
    });
  },
  create(data: Prisma.QuotationCreateInput) {
    return prisma.quotation.create({ data, include: quotationInclude });
  },
  findAll(userId: number) {
    return prisma.quotation.findMany({
      where: { createdById: userId },
      // include: quotationInclude,
      orderBy: { createdAt: "desc" },
    });
  },
  findById(id: number, userId: number) {
    return prisma.quotation.findUnique({
      where: { id, createdById: userId },
      include: quotationInclude,
    });
  },
  findOwned(id: number, userId: number) {
    return prisma.quotation.findUnique({ where: { id, createdById: userId } });
  },
  update(id: number, data: Prisma.QuotationUpdateInput) {
    return prisma.quotation.update({
      where: { id },
      data,
      include: quotationInclude,
    });
  },
  findInvoiceForQuotation(id: number, userId: number) {
    return prisma.invoice.findFirst({
      where: { quotationId: id, createdById: userId },
      select: { id: true },
    });
  },
  delete(id: number) {
    return prisma.quotation.delete({ where: { id } });
  },
};
