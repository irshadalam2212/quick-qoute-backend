import type { UpdateProfileBody } from "../types/api.js";
import type { UploadedFields } from "../middleware/multer.middleware.js";
import { ApiError } from "../utils/apierror.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { optionalText } from "../utils/text.js";
import { userRepository } from "../repositories/user.repository.js";

export const userService = {
  async getProfile(userId: number) {
    const user = await userRepository.findProfile(userId);
    if (!user) throw new ApiError(404, "User not found.");
    return user;
  },

  async listUsers(role: string) {
    if (role !== "ADMIN")
      throw new ApiError(403, "You are not allowed to view users.");
    return userRepository.findUsers();
  },

  async updateProfile(
    userId: number,
    body: UpdateProfileBody,
    files?: UploadedFields,
  ) {
    const logoFile = files?.logo?.[0];
    const signatureFile = files?.signature?.[0];
    const [logo, signature] = await Promise.all([
      logoFile
        ? uploadToCloudinary(logoFile.buffer, "quickquote/users/logos")
        : undefined,
      signatureFile
        ? uploadToCloudinary(
            signatureFile.buffer,
            "quickquote/users/signatures",
          )
        : undefined,
    ]);
    if (!(await userRepository.findProfile(userId)))
      throw new ApiError(404, "User not found.");

    return userRepository.updateProfile(userId, {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.companyName !== undefined && {
        companyName: optionalText(body.companyName),
      }),
      ...(body.mobileNumber !== undefined && {
        mobileNumber: optionalText(body.mobileNumber),
      }),
      ...(body.alternateMobile !== undefined && {
        alternateMobile: optionalText(body.alternateMobile),
      }),
      ...(body.website !== undefined && {
        website: optionalText(body.website),
      }),
      ...(body.gstNumber !== undefined && {
        gstNumber: optionalText(body.gstNumber),
      }),
      ...(body.panNumber !== undefined && {
        panNumber: optionalText(body.panNumber),
      }),
      ...(body.services !== undefined && {
        services: optionalText(body.services),
      }),
      ...(body.address !== undefined && {
        address: optionalText(body.address),
      }),
      ...(logo && { logo: logo.secure_url }),
      ...(signature && { signature: signature.secure_url }),
    });
  },
};
