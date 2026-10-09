import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import type { RegisterUserBody } from "../types/api.js";
import type { UploadedFields } from "../middleware/multer.middleware.js";
import { ApiError } from "../utils/apierror.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { authRepository } from "../repositories/auth.repository.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

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
    const logoFile = files?.logo?.[0];
    const signatureFile = files?.signature?.[0];
    let logoUrl: string | null = null;
    let signatureUrl: string | null = null;
    if (logoFile)
      logoUrl = (
        await uploadToCloudinary(logoFile.buffer, "quickquote/users/logos")
      ).secure_url;
    if (signatureFile)
      signatureUrl = (
        await uploadToCloudinary(
          signatureFile.buffer,
          "quickquote/users/signatures",
        )
      ).secure_url;
    const hashedPassword = await bcrypt.hash(password, 10);
    return authRepository.createRegisteredUser({
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
    });
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
