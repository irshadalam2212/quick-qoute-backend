import jwt, { type SignOptions } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  id: number;
  email: string;
  name: string;
}

export interface RefreshTokenPayload {
  id: number;
}

// Expiry comes from env as a plain string (e.g. "1d"); jsonwebtoken types it as a ms-style literal.
const expiryOptions = (expiresIn: string | undefined): SignOptions =>
  expiresIn
    ? { expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]> }
    : {};

export const generateAccessToken = (
  user: Pick<User, "id" | "email" | "name">,
): string => {
  const payload: AccessTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(
    payload,
    env.ACCESS_TOKEN_SECRET,
    expiryOptions(env.ACCESS_TOKEN_EXPIRY),
  );
};

export const generateRefreshToken = (userId: number): string => {
  const payload: RefreshTokenPayload = {
    id: userId,
  };

  return jwt.sign(
    payload,
    env.REFRESH_TOKEN_SECRET,
    expiryOptions(env.REFRESH_TOKEN_EXPIRY),
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
