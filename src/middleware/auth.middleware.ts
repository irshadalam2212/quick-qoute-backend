import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { verifyAccessToken } from "../utils/jwt.js";

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
