import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import type { RegisterUserBody } from "../types/api.js";
import {
  isAllowedImage,
  MAX_IMAGE_SIZE,
  type UploadedFields,
} from "../middleware/multer.middleware.js";
import { ApiError } from "../utils/apierror.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { authRepository } from "../repositories/auth.repository.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { optionalText } from "../utils/text.js";

const GUEST_ACCOUNT_EMAIL = "guest@quickquote.local";

let guestPasswordHashPromise: Promise<string> | undefined;

export const authService = {
  async register(body: RegisterUserBody, files?: UploadedFields) {
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
    } = body;
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === GUEST_ACCOUNT_EMAIL)
      throw new ApiError(409, "This email address is reserved.");
    if (await authRepository.findByEmail(normalizedEmail))
      throw new ApiError(409, "User already exists");
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await authRepository.createRegisteredUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        companyName: optionalText(companyName),
        mobileNumber: optionalText(mobileNumber),
        alternateMobile: optionalText(alternateMobile),
        website: optionalText(website),
        gstNumber: optionalText(gstNumber),
        panNumber: optionalText(panNumber),
        services: optionalText(services),
        address: optionalText(address),
      });
    } catch (error) {
      // A concurrent registration can win the race after the existence check.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ApiError(409, "User already exists");
      throw error;
    }
    // The account exists from here on; image problems only produce warnings.
    return this.attachRegistrationImages(user, files);
  },

  /**
   * Best-effort upload of the optional logo and signature for a newly created
   * user. Never throws: each image that can't be stored is skipped and
   * reported in `warnings` so the user can add it later from their profile.
   */
  async attachRegistrationImages<T extends { id: number }>(
    user: T,
    files?: UploadedFields,
  ): Promise<T & { warnings: string[] }> {
    const warnings: string[] = [];
    const images = [
      { field: "logo", label: "Logo", folder: "quickquote/users/logos" },
      {
        field: "signature",
        label: "Signature",
        folder: "quickquote/users/signatures",
      },
    ] as const;

    const uploads = await Promise.all(
      images.map(async ({ field, label, folder }) => {
        const file = files?.[field]?.[0];
        if (!file) return null;
        if (file.size > MAX_IMAGE_SIZE || !isAllowedImage(file.buffer)) {
          warnings.push(
            `${label} was skipped: only JPG, PNG or WEBP images up to 5 MB are allowed. You can add it from your profile.`,
          );
          return null;
        }
        try {
          return { field, upload: await uploadToCloudinary(file.buffer, folder) };
        } catch (error) {
          console.error(`Registration ${field} upload failed:`, error);
          warnings.push(
            `${label} could not be uploaded. You can add it from your profile.`,
          );
          return null;
        }
      }),
    );

    const uploaded = uploads.filter((entry) => entry !== null);
    if (uploaded.length === 0) return { ...user, warnings };

    try {
      const updated = await authRepository.saveImages(
        user.id,
        Object.fromEntries(
          uploaded.map(({ field, upload }) => [field, upload.secure_url]),
        ),
      );
      return { ...user, ...updated, warnings };
    } catch (error) {
      console.error("Saving registration images failed:", error);
      // Nothing references these uploads, so remove them.
      await deleteFromCloudinary(uploaded.map(({ upload }) => upload));
      warnings.push(
        "Images could not be saved. You can add them from your profile.",
      );
      return { ...user, warnings };
    }
  },

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email.toLowerCase().trim());
    // Keep the response identical for unknown accounts and wrong passwords to
    // avoid exposing which email addresses are registered.
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new ApiError(401, "Invalid email or password");
    const tokens = await this.generateTokens(user.id);
    // const loggedInUser = await authRepository.findAuthenticatedUser(user.id);
    return { ...tokens };
  },

  async startGuestSession() {
    const password = await this.guestPasswordHash();
    const user = await authRepository.upsertGuest(
      GUEST_ACCOUNT_EMAIL,
      password,
    );
    if (user.role !== "GUEST")
      throw new ApiError(409, "The configured guest account is unavailable.");
    return { ...(await this.generateTokens(user.id)) };
  },

  logout(userId: number) {
    return authRepository.saveRefreshToken(userId, null);
  },

  async refreshSession(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await authRepository.findById(decoded.id);
      if (!user || token !== user.refreshToken)
        throw new ApiError(401, "Invalid refresh token");
      return this.generateTokens(user.id);
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }
  },

  async generateTokens(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await authRepository.findById(userId);
      if (!user) throw new ApiError(404, "User not found");
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user.id);
      await authRepository.saveRefreshToken(user.id, refreshToken);
      return { accessToken, refreshToken };
    } catch {
      throw new ApiError(
        500,
        "Something went wrong while generating access token",
      );
    }
  },

  guestPasswordHash() {
    guestPasswordHashPromise ??= bcrypt.hash(
      randomBytes(32).toString("hex"),
      10,
    );
    return guestPasswordHashPromise;
  },
};
