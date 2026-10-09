import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

const userProfileSelect = {
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
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userRepository = {
  findProfile(id: number) {
    return prisma.user.findUnique({ where: { id }, select: userProfileSelect });
  },
  findUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        mobileNumber: true,
        alternateMobile: true,
        logo: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  updateProfile(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: userProfileSelect,
    });
  },
};
