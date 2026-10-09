import type { RequestHandler } from "express";
import multer from "multer";
import { ApiError } from "../utils/apierror.js";

const storage = multer.memoryStorage();

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const fieldLimits = {
  files: 2, // logo + signature
  fields: 20,
  fieldSize: 16 * 1024, // 16 KB per text field
};

/** Strict upload: any invalid image rejects the whole request. */
export const upload = multer({
  storage,

  limits: {
    fileSize: MAX_IMAGE_SIZE,
    ...fieldLimits,
  },

  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
    }

    cb(null, true);
  },
});

/**
 * Lenient upload for registration: images are optional extras, so files are
 * only buffered here and checked by the service, which skips bad ones instead
 * of failing sign-up. The higher hard cap only guards server memory.
 */
export const registerUpload = multer({
  storage,
  limits: {
    fileSize: 2 * MAX_IMAGE_SIZE,
    ...fieldLimits,
  },
});

/** Shape of `req.files` when using `upload.fields(...)`. */
export type UploadedFields = Record<string, Express.Multer.File[] | undefined>;

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  buffer.length >= offset + bytes.length &&
  bytes.every((byte, index) => buffer[offset + index] === byte);

export const isAllowedImage = (buffer: Buffer) =>
  startsWith(buffer, [0xff, 0xd8, 0xff]) || // JPEG
  startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) || // PNG
  (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && // "RIFF"
    startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)); // "WEBP"

/**
 * The client controls `mimetype`, so confirm each buffered upload's file
 * signature actually matches an allowed image format.
 */
export const verifyImageUploads: RequestHandler = (req, _res, next) => {
  const files = Object.values((req.files as UploadedFields | undefined) ?? {})
    .flatMap((group) => group ?? []);
  if (files.some((file) => !isAllowedImage(file.buffer))) {
    return next(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
  }
  next();
};

/** Rejects requests whose body is not sent as FormData. */
export const requireMultipart: RequestHandler = (req, _res, next) => {
  if (!req.is("multipart/form-data")) {
    return next(
      new ApiError(415, "Request body must be sent as multipart/form-data"),
    );
  }
  next();
};
