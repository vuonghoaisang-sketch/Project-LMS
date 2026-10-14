import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "node:fs";
import path from "node:path";
import AppError from "../utils/AppError";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log("Cloudinary storage provider initialized.");
} else {
  console.log("Local disk storage provider active (Cloudinary credentials not set).");
}

export async function uploadImageFile(
  file: Express.Multer.File,
  baseUrl: string,
): Promise<{ url: string; publicId?: string; size: number }> {
  if (!file) {
    throw new AppError("No image file uploaded", 400);
  }

  if (isCloudinaryEnabled) {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        file.path,
        {
          folder: "lms/images",
          resource_type: "image",
          format: "webp",
          transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
        },
      );

      // Remove local temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
      };
    } catch (error) {
      console.error("Cloudinary image upload failed:", error);
      throw new AppError("Failed to upload image to cloud storage", 500);
    }
  }

  // Local URL fallback
  const relativePath = `/uploads/images/${path.basename(file.path)}`;
  const fullUrl = `${baseUrl}${relativePath}`;

  return {
    url: fullUrl,
    size: file.size,
  };
}

export async function uploadVideoFile(
  file: Express.Multer.File,
  baseUrl: string,
): Promise<{ url: string; publicId?: string; size: number; duration?: number }> {
  if (!file) {
    throw new AppError("No video file uploaded", 400);
  }

  if (isCloudinaryEnabled) {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        file.path,
        {
          folder: "lms/videos",
          resource_type: "video",
          chunk_size: 6000000, // 6MB chunks for reliability
        },
      );

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        duration: result.duration,
      };
    } catch (error) {
      console.error("Cloudinary video upload failed:", error);
      throw new AppError("Failed to upload video to cloud storage", 500);
    }
  }

  // Local URL fallback
  const relativePath = `/uploads/videos/${path.basename(file.path)}`;
  const fullUrl = `${baseUrl}${relativePath}`;

  return {
    url: fullUrl,
    size: file.size,
  };
}

export async function uploadAttachmentFile(
  file: Express.Multer.File,
  baseUrl: string,
): Promise<{
  url: string;
  name: string;
  size: number;
  type: string;
}> {
  if (!file) {
    throw new AppError("No attachment file uploaded", 400);
  }

  if (isCloudinaryEnabled) {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        file.path,
        {
          folder: "lms/attachments",
          resource_type: "raw",
        },
      );

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      console.error("Cloudinary attachment upload failed:", error);
      throw new AppError("Failed to upload attachment to cloud storage", 500);
    }
  }

  const relativePath = `/uploads/attachments/${path.basename(file.path)}`;
  const fullUrl = `${baseUrl}${relativePath}`;

  return {
    url: fullUrl,
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
  };
}
