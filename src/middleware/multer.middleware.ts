import multer from "multer";
import { ApiError } from "../utils/apierror.js";

const storage = multer.memoryStorage();

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
    }

    cb(null, true);
  },
});

/** Shape of `req.files` when using `upload.fields(...)`. */
export type UploadedFields = Record<string, Express.Multer.File[] | undefined>;
