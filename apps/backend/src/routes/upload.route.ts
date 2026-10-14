import { Router } from "express";
import {
  uploadImageController,
  uploadVideoController,
  uploadAttachmentController,
} from "../controllers/upload.controller";
import {
  imageUpload,
  videoUpload,
  attachmentUpload,
} from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Upload image (avatars, thumbnails) - authenticated users
router.post(
  "/image",
  authMiddleware,
  imageUpload.single("file"),
  uploadImageController,
);

// Upload video - instructors and admins
router.post(
  "/video",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  videoUpload.single("file"),
  uploadVideoController,
);

// Upload attachment (slides, zip, pdf) - instructors and admins
router.post(
  "/attachment",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  attachmentUpload.single("file"),
  uploadAttachmentController,
);

export default router;
