import { Request, Response } from "express";
import {
  issueCertificate,
  verifyCertificate,
  getMyCertificates,
  generateCertificatePDF,
} from "../services/certificate.service";

export async function issueCertificateController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const user = (req as any).user;
  const result = await issueCertificate(user.id, courseId);
  return res.json({ success: true, ...result });
}

export async function verifyCertificateController(req: Request, res: Response) {
  const code = String(req.params.code);
  const cert = await verifyCertificate(code);
  return res.json({ success: true, valid: true, certificate: cert });
}

export async function getMyCertificatesController(req: Request, res: Response) {
  const user = (req as any).user;
  const certificates = await getMyCertificates(user.id);
  return res.json({ success: true, certificates });
}

export async function downloadCertificateController(
  req: Request,
  res: Response,
) {
  const courseId = Number(req.params.courseId);
  const user = (req as any).user;
  const pdfBuffer = await generateCertificatePDF(user.id, courseId);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-course-${courseId}.pdf"`,
  );
  res.setHeader("Content-Length", pdfBuffer.length);
  return res.end(pdfBuffer);
}
