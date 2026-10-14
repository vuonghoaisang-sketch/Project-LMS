import { Router } from "express";
import {
  issueCertificateController,
  verifyCertificateController,
  getMyCertificatesController,
  downloadCertificateController,
} from "../controllers/certificate.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Student: get all my earned certificates
router.get("/my-certificates", authMiddleware, getMyCertificatesController);

// Student: claim / issue certificate for completed course
router.post(
  "/courses/:courseId/certificate",
  authMiddleware,
  requireRole(["student", "admin"]),
  issueCertificateController,
);

// Student: download official PDF certificate with QR code
router.get(
  "/courses/:courseId/certificate/download",
  authMiddleware,
  requireRole(["student", "admin"]),
  downloadCertificateController,
);

// Public: verify authenticity of a certificate by certificate code
router.get("/verify/:code", verifyCertificateController);

export default router;
