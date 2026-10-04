import prisma from "../lib/prisma.js";

export const unitRepository = {
  findActive() {
    return prisma.unit.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },
};
