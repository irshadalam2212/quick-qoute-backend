import prisma from "../lib/prisma.js";

export const categoryRepository = {
  findDuplicate(name: string, code: string) {
    return prisma.category.findFirst({ where: { OR: [{ name }, { code }] } });
  },
  create(data: {
    name: string;
    code: string;
    description?: string;
    createdById: number;
  }) {
    return prisma.category.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        createdBy: { connect: { id: data.createdById } },
      },
    });
  },
  findAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },
  findById(id: number) {
    return prisma.category.findUnique({ where: { id } });
  },
  update(
    id: number,
    data: {
      name?: string;
      code?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return prisma.category.update({ where: { id }, data });
  },
  delete(id: number) {
    return prisma.category.delete({ where: { id } });
  },
};
