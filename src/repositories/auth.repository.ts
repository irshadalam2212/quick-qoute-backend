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

export const authRepository = {
  findAccessUser(id: number) {
    return prisma.user.findUnique({
      where: { id },
      omit: { password: true, refreshToken: true },
    });
  },
  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  saveRefreshToken(id: number, refreshToken: string | null) {
    return prisma.user.update({ where: { id }, data: { refreshToken } });
  },
  createRegisteredUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: { ...userProfileSelect, updatedAt: false },
    });
  },
  saveImages(id: number, data: { logo?: string; signature?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { ...userProfileSelect, updatedAt: false },
    });
  },
  findAuthenticatedUser(id: number) {
    return prisma.user.findUnique({
      where: { id },
      omit: { password: true, refreshToken: true },
    });
  },
  upsertGuest(email: string, password: string) {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "Guest User",
        password,
        role: "GUEST",
        companyName: "QuickQuote Demo",
        services: "Construction and interior work",
      },
      select: userProfileSelect,
    });
  },
};
