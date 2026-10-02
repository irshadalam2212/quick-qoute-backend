import type { CookieOptions } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import type { UploadedFields } from "../middleware/multer.middleware.js";
import type {
  LoginBody,
  RefreshTokenBody,
  RegisterUserBody,
  UpdateProfileBody,
} from "../types/api.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { getAuthUser } from "../utils/auth.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { APP_FEATURES, DEFAULT_USER_FEATURES, isAppFeature } from "../utils/permissions.js";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
};

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
  featurePermissions: { select: { feature: true } },
} satisfies Prisma.UserSelect;

const GUEST_ACCOUNT_EMAIL = "guest@quickquote.local";
let guestPasswordHashPromise: Promise<string> | undefined;

const getGuestPasswordHash = () =>
  (guestPasswordHashPromise ??= bcrypt.hash(randomBytes(32).toString("hex"), 10));

const generateAccessAndRefreshToken = async (
  userId: number,
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

const registerUser = asyncHandler<ParamsDictionary, RegisterUserBody>(
  async (req, res) => {
    const {
      name,
      email,
      password,
      companyName,
      mobileNumber,
      alternateMobile,
      website,
      gstNumber,
      panNumber,
      services,
      address,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === GUEST_ACCOUNT_EMAIL) {
      throw new ApiError(409, "This email address is reserved.");
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    // Files uploaded by multer
    const files = req.files as UploadedFields | undefined;
    const logoFile = files?.logo?.[0];
    const signatureFile = files?.signature?.[0];

    let logoUrl: string | null = null;
    let signatureUrl: string | null = null;

    // Upload logo
    if (logoFile) {
      const result = await uploadToCloudinary(
        logoFile.buffer,
        "quickquote/users/logos",
      );

      logoUrl = result.secure_url;
    }

    // Upload signature
    if (signatureFile) {
      const result = await uploadToCloudinary(
        signatureFile.buffer,
        "quickquote/users/signatures",
      );

      signatureUrl = result.secure_url;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,

        companyName,
        mobileNumber,
        alternateMobile,
        website,
        gstNumber,
        panNumber,
        services,
        address,

        logo: logoUrl,
        signature: signatureUrl,
        featurePermissions: {
          create: DEFAULT_USER_FEATURES.map((feature) => ({ feature })),
        },
      },

      select: {
        ...userProfileSelect,
        updatedAt: false,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  },
);

const login = asyncHandler<ParamsDictionary, LoginBody>(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  // Compare password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user.id,
  );

  // Get user without sensitive fields
  const loggedInUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: userProfileSelect,
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const guestLogin = asyncHandler(async (_req, res) => {
  const passwordHash = await getGuestPasswordHash();

  const guest = await prisma.user.upsert({
    where: { email: GUEST_ACCOUNT_EMAIL },
    update: {},
    create: {
      email: GUEST_ACCOUNT_EMAIL,
      name: "Guest User",
      password: passwordHash,
      role: "GUEST",
      companyName: "QuickQuote Demo",
      services: "Construction and interior work",
      featurePermissions: {
        create: DEFAULT_USER_FEATURES.map((feature) => ({ feature })),
      },
    },
    select: userProfileSelect,
  });

  if (guest.role !== "GUEST") {
    throw new ApiError(409, "The configured guest account is unavailable.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(guest.id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: guest, accessToken, refreshToken },
        "Guest session started successfully.",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  const authUser = getAuthUser(req);

  await prisma.user.update({
    where: {
      id: authUser.id,
    },
    data: {
      refreshToken: null,
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const authUser = getAuthUser(req);

  const user = await prisma.user.findUnique({
    where: {
      id: authUser.id,
    },

    select: userProfileSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const userWithEffectiveFeatures = {
    ...user,
    featurePermissions: user.role === "ADMIN"
      ? APP_FEATURES.map((feature) => ({ feature }))
      : user.featurePermissions,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, userWithEffectiveFeatures, "Current user fetched successfully."));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
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
      featurePermissions: { select: { feature: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const usersWithEffectiveFeatures = users.map((user) => ({
    ...user,
    featurePermissions: user.role === "ADMIN"
      ? APP_FEATURES.map((feature) => ({ feature }))
      : user.featurePermissions,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, usersWithEffectiveFeatures, "Users fetched successfully."));
});

const getAvailableFeatures = asyncHandler(async (req, res) => {
  const authUser = getAuthUser(req);
  if (authUser.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can manage feature access.");
  }

  const features = APP_FEATURES.map((key) => ({
    key,
    defaultEnabled: DEFAULT_USER_FEATURES.includes(key),
  }));

  return res.status(200).json(new ApiResponse(200, features, "Features fetched successfully."));
});

const updateUserPermissions = asyncHandler(async (req, res) => {
  const authUser = getAuthUser(req);
  const userId = Number(req.params.userId);
  const { features } = req.body as { features?: unknown };

  if (authUser.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can manage feature access.");
  }
  if (!Number.isInteger(userId) || userId < 1) {
    throw new ApiError(400, "Invalid user ID.");
  }
  if (!Array.isArray(features) || !features.every(isAppFeature)) {
    throw new ApiError(400, `Features must be an array containing only: ${APP_FEATURES.join(", ")}.`);
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) {
    throw new ApiError(404, "User not found.");
  }
  if (target.role === "ADMIN") {
    throw new ApiError(400, "Admin feature access is always enabled and cannot be changed.");
  }

  const uniqueFeatures = [...new Set(features)];
  await prisma.$transaction([
    prisma.userFeaturePermission.deleteMany({ where: { userId } }),
    ...(uniqueFeatures.length
      ? [prisma.userFeaturePermission.createMany({ data: uniqueFeatures.map((feature) => ({ userId, feature })) })]
      : []),
  ]);

  return res.status(200).json(new ApiResponse(200, {
    userId,
    features: uniqueFeatures,
  }, "Feature access updated successfully."));
});

const refreshAccessToken = asyncHandler<ParamsDictionary, RefreshTokenBody>(
  async (req, res) => {
    const incomingRefreshToken: string | undefined =
      req.cookies.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized access");
    }

    try {
      const decodedToken = verifyRefreshToken(incomingRefreshToken);

      const user = await prisma.user.findUnique({
        where: {
          id: decodedToken.id,
        },
      });

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired");
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshToken(user.id);

      return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
          new ApiResponse(
            200,
            {
              accessToken,
              refreshToken: newRefreshToken,
            },
            "Access token refreshed",
          ),
        );
    } catch (error) {
      throw new ApiError(401, "Invalid refresh token");
    }
  },
);

const updateProfile = asyncHandler<ParamsDictionary, UpdateProfileBody>(
  async (req, res) => {
    const authUser = getAuthUser(req);

    const {
      name,
      companyName,
      mobileNumber,
      alternateMobile,
      website,
      gstNumber,
      panNumber,
      services,
      address,
    } = req.body;

    const files = req.files as UploadedFields | undefined;
    const logoFile = files?.logo?.[0];
    const signatureFile = files?.signature?.[0];

    const [uploadedLogo, uploadedSignature] = await Promise.all([
      logoFile
        ? uploadToCloudinary(logoFile.buffer, "quickquote/users/logos")
        : undefined,
      signatureFile
        ? uploadToCloudinary(signatureFile.buffer, "quickquote/users/signatures")
        : undefined,
    ]);

    const optionalText = (value: string | null | undefined) =>
      value == null ? value : value.trim() || null;

    const user = await prisma.user.findUnique({
      where: {
        id: authUser.id,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: authUser.id,
      },

      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(companyName !== undefined && { companyName: optionalText(companyName) }),
        ...(mobileNumber !== undefined && { mobileNumber: optionalText(mobileNumber) }),
        ...(alternateMobile !== undefined && { alternateMobile: optionalText(alternateMobile) }),
        ...(website !== undefined && { website: optionalText(website) }),
        ...(gstNumber !== undefined && { gstNumber: optionalText(gstNumber) }),
        ...(panNumber !== undefined && { panNumber: optionalText(panNumber) }),
        ...(services !== undefined && { services: optionalText(services) }),
        ...(address !== undefined && { address: optionalText(address) }),
        ...(uploadedLogo && { logo: uploadedLogo.secure_url }),
        ...(uploadedSignature && { signature: uploadedSignature.secure_url }),
      },

      select: userProfileSelect,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully."));
  },
);

export {
  registerUser,
  login,
  guestLogin,
  logout,
  getCurrentUser,
  getUsers,
  getAvailableFeatures,
  refreshAccessToken,
  updateProfile,
  updateUserPermissions,
};
