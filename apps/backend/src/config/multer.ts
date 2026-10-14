import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import AppError from "../utils/AppError";

// Base uploads directory
export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Ensure standard folders exist
ensureDir(path.join(UPLOADS_DIR, "images"));
ensureDir(path.join(UPLOADS_DIR, "videos"));
ensureDir(path.join(UPLOADS_DIR, "attachments"));

// Disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = "attachments";

    if (file.mimetype.startsWith("image/")) {
      subfolder = "images";
    } else if (file.mimetype.startsWith("video/")) {
      subfolder = "videos";
    }

    const dest = path.join(UPLOADS_DIR, subfolder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Image upload filter (max 5MB)
export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Invalid image format. Supported formats: JPG, PNG, WEBP, GIF, SVG",
          400,
        ),
      );
    }
  },
});

// Video upload filter (max 100MB)
export const videoUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-matroska",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Invalid video format. Supported formats: MP4, WEBM, OGG, MOV, MKV",
          400,
        ),
      );
    }
  },
});

// Attachment upload filter (PDF, ZIP, Word, Slides - max 25MB)
export const attachmentUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".pdf",
      ".zip",
      ".rar",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".txt",
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Invalid attachment type. Allowed: PDF, ZIP, RAR, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT",
          400,
        ),
      );
    }
  },
});
