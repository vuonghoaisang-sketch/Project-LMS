import { Request, Response } from "express";
import {
  uploadImageFile,
  uploadVideoFile,
  uploadAttachmentFile,
} from "../services/storage.service";
import AppError from "../utils/AppError";

function getBaseUrl(req: Request): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

export async function uploadImageController(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError("Please select an image file to upload", 400);
  }

  const baseUrl = getBaseUrl(req);
  const result = await uploadImageFile(req.file, baseUrl);

  return res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    ...result,
  });
}

export async function uploadVideoController(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError("Please select a video file to upload", 400);
  }

  const baseUrl = getBaseUrl(req);
  const result = await uploadVideoFile(req.file, baseUrl);

  return res.status(200).json({
    success: true,
    message: "Video uploaded successfully",
    ...result,
  });
}

export async function uploadAttachmentController(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError("Please select an attachment file to upload", 400);
  }

  const baseUrl = getBaseUrl(req);
  const result = await uploadAttachmentFile(req.file, baseUrl);

  return res.status(200).json({
    success: true,
    message: "Attachment uploaded successfully",
    attachment: result,
  });
}
