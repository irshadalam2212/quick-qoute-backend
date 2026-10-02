import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { verifyAccessToken } from "../utils/jwt.js";
import type { AppFeature } from "../utils/permissions.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token: string | undefined =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id,
      },
      omit: {
        password: true,
        refreshToken: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});

/** Enforce a feature grant after verifyJWT. ADMIN accounts always have full access. */
export const requireFeature = (feature: AppFeature) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (req.user.role === "ADMIN") {
      next();
      return;
    }

    const grant = await prisma.userFeaturePermission.findUnique({
      where: { userId_feature: { userId: req.user.id, feature } },
      select: { id: true },
    });

    if (!grant) {
      throw new ApiError(403, "You do not have access to this feature.");
    }

    next();
  });
