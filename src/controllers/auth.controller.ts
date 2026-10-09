import type { CookieOptions } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
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
import { authService } from "../services/auth.service.js";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
};

const registerUser = asyncHandler<ParamsDictionary, RegisterUserBody>(
  async (req, res) => {
    const user = await authService.register(
      req.body,
      req.files as UploadedFields | undefined,
    );
    return res.status(201).json(new ApiResponse(201, user, "User registered"));
  },
);

const login = asyncHandler<ParamsDictionary, LoginBody>(async (req, res) => {
  const session = await authService.login(req.body.email, req.body.password);
  return res
    .status(200)
    .cookie("accessToken", session.accessToken, cookieOptions)
    .cookie("refreshToken", session.refreshToken, cookieOptions)
    .json(new ApiResponse(200, session, "User logged in"));
});

const guestLogin = asyncHandler(async (_req, res) => {
  const session = await authService.startGuestSession();
  return res
    .status(200)
    .cookie("accessToken", session.accessToken, cookieOptions)
    .cookie("refreshToken", session.refreshToken, cookieOptions)
    .json(new ApiResponse(200, session, "Guest session started"));
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(getAuthUser(req).id);
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.currentUser(getAuthUser(req).id);
  return res.status(200).json(new ApiResponse(200, user, "Profile fetched."));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await authService.listUsers(getAuthUser(req).role);
  return res.status(200).json(new ApiResponse(200, users, "Users fetched"));
});

const refreshAccessToken = asyncHandler<ParamsDictionary, RefreshTokenBody>(
  async (req, res) => {
    const token: string | undefined =
      req.cookies.refreshToken || req.body?.refreshToken;
    if (!token) throw new ApiError(401, "Unauthorized access");
    const session = await authService.refreshSession(token);
    return res
      .status(200)
      .cookie("accessToken", session.accessToken, cookieOptions)
      .cookie("refreshToken", session.refreshToken, cookieOptions)
      .json(new ApiResponse(200, session, "Access token refreshed"));
  },
);

const updateProfile = asyncHandler<ParamsDictionary, UpdateProfileBody>(
  async (req, res) => {
    await authService.updateProfile(
      getAuthUser(req).id,
      req.body,
      req.files as UploadedFields | undefined,
    );
    return res.status(200).json(new ApiResponse(200, [], "Profile updated"));
  },
);

export {
  registerUser,
  login,
  guestLogin,
  logout,
  getCurrentUser,
  getUsers,
  refreshAccessToken,
  updateProfile,
};
