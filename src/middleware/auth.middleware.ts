import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { authRepository } from "../repositories/auth.repository.js";
import { getAuthUser } from "../utils/auth.js";

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  if (getAuthUser(req).role !== "ADMIN") {
    throw new ApiError(403, "You are not allowed to manage scope-of-work items.");
  }

  next();
});

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token: string | undefined =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = verifyAccessToken(token);

    const user = await authRepository.findAccessUser(decodedToken.id);

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});
