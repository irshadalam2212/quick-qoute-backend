import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apierror.js";

/** Maps Prisma's known request error codes to client-facing API errors. */
const fromPrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
): ApiError | null => {
  switch (error.code) {
    case "P2000":
      return new ApiError(400, "A value is too long for its field.");
    case "P2002":
      return new ApiError(409, "A record with this value already exists.");
    case "P2003":
      return new ApiError(
        409,
        "This record is referenced by other records and cannot be changed or deleted.",
      );
    case "P2025":
      return new ApiError(404, "Record not found.");
    default:
      return null;
  }
};

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof multer.MulterError) {
    return new ApiError(400, error.message);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return fromPrismaError(error) ?? new ApiError(500);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(400, "Received data is not valid");
  }

  // body-parser errors (malformed JSON, payload too large) carry a 4xx status.
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    return new ApiError(status, (error as Error).message);
  }

  return new ApiError(500);
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const apiError = toApiError(error);

  if (apiError.code >= 500) {
    console.error(error);
  }

  res.status(apiError.code).json({
    code: apiError.code,
    data: apiError.data,
    message: apiError.message,
    success: false,
    errors: apiError.errors,
    ...(env.NODE_ENV !== "production" &&
      error instanceof Error && { stack: error.stack }),
  });
};
