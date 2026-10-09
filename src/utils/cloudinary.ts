import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload returned no result"));
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Best-effort removal of uploads that ended up unused. Failures are logged
 * rather than thrown so they never mask the error that triggered the cleanup.
 */
export const deleteFromCloudinary = async (
  uploads: UploadApiResponse[],
): Promise<void> => {
  const results = await Promise.allSettled(
    uploads.map((upload) =>
      cloudinary.uploader.destroy(upload.public_id, { resource_type: "image" }),
    ),
  );
  results.forEach((result, index) => {
    if (result.status === "rejected")
      console.error(
        `Failed to delete orphaned Cloudinary upload ${uploads[index]?.public_id}:`,
        result.reason,
      );
  });
};
