import type { ParamsDictionary } from "express-serve-static-core";
import type { UpdateProfileBody } from "../types/api.js";
import type { UploadedFields } from "../middleware/multer.middleware.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { getAuthUser } from "../utils/auth.js";
import { userService } from "../services/user.service.js";

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(getAuthUser(req).id);
  return res.status(200).json(new ApiResponse(200, user, "Profile fetched."));
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(getAuthUser(req).role);
  return res.status(200).json(new ApiResponse(200, users, "Users fetched"));
});

export const updateProfile = asyncHandler<ParamsDictionary, UpdateProfileBody>(
  async (req, res) => {
    await userService.updateProfile(
      getAuthUser(req).id,
      req.body,
      req.files as UploadedFields | undefined,
    );
    return res.status(200).json(new ApiResponse(200, [], "Profile updated"));
  },
);
