import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import {
  findCertificate,
  findCertificateByCode,
  createCertificate,
  getUserCertificates,
} from "../models/certificate.model";
import { findUserById } from "../models/user.model";
import { findCourseById } from "../models/course.model";
import { getCourseProgressRows } from "../models/learning-progress.model";
import { createNotification } from "../models/notification.model";
import AppError from "../utils/AppError";

function generateCertCode(userId: number, courseId: number): string {
  const raw = `${userId}-${courseId}-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  const hash = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();
  return `LMS-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
}

export async function issueCertificate(
  userId: number,
  courseId: number,
): Promise<{ certificate: any; isNew: boolean }> {
  const existing = await findCertificate(userId, courseId);
  if (existing) return { certificate: existing, isNew: false };

  // Check 100% completion requirement
  const progressRows = await getCourseProgressRows(userId, courseId);
  const total = progressRows.length;
  const completed = progressRows.filter((r) => r.completed_at !== null).length;

  if (total === 0 || completed < total) {
    throw new AppError(
      `You have completed ${completed}/${total} lessons. You must complete 100% of the course to claim your certificate.`,
      403,
    );
  }

  const code = generateCertCode(userId, courseId);
  const cert = await createCertificate({
    user_id: userId,
    course_id: courseId,
    certificate_code: code,
  });

  await createNotification({
    user_id: userId,
    type: "certificate_issued",
    message:
      "Congratulations! Your Course Completion Certificate has been officially issued.",
    reference_id: cert.id,
    reference_type: "certificate",
  });

  return { certificate: cert, isNew: true };
}

export async function verifyCertificate(code: string) {
  const cert = await findCertificateByCode(code.trim().toUpperCase());
  if (!cert) throw new AppError("Certificate not found or invalid", 404);
  return cert;
}

export async function getMyCertificates(userId: number) {
  return getUserCertificates(userId);
}

export async function generateCertificatePDF(
  userId: number,
  courseId: number,
): Promise<Buffer> {
  let cert = await findCertificate(userId, courseId);
  if (!cert) {
    // Attempt auto-issue if eligible
    const result = await issueCertificate(userId, courseId);
    cert = result.certificate;
  }

  if (!cert) {
    throw new AppError("Certificate not found. Complete 100% of the course first.", 404);
  }
  const finalCert = cert;

  const user = await findUserById(userId);
  const course = await findCourseById(courseId);

  const frontendUrl =
    process.env.FRONTEND_ORIGINS?.split(",")[0] || "http://localhost:3000";
  const verifyUrl = `${frontendUrl}/verify-certificate/${finalCert.certificate_code}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const width = doc.page.width;
    const height = doc.page.height;

    // Background and Luxury Borders
    doc.rect(0, 0, width, height).fill("#090d16");
    doc.rect(25, 25, width - 50, height - 50).stroke("#1e293b");
    doc.lineWidth(2);
    doc.rect(32, 32, width - 64, height - 64).stroke("#3b82f6");
    doc.lineWidth(1);
    doc.rect(36, 36, width - 72, height - 72).stroke("#60a5fa");

    // Brand Header
    doc
      .fillColor("#60a5fa")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("LMS LEARNING PLATFORM", 0, 70, { align: "center", characterSpacing: 2 });

    // Certificate Title
    doc
      .fillColor("#ffffff")
      .fontSize(32)
      .font("Helvetica-Bold")
      .text("CERTIFICATE OF COMPLETION", 0, 105, { align: "center" });

    doc
      .fillColor("#94a3b8")
      .fontSize(13)
      .font("Helvetica")
      .text("This is proudly presented to", 0, 160, { align: "center" });

    // Recipient Name
    doc
      .fillColor("#fbbf24")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text(user?.name || "Distinguished Learner", 0, 185, { align: "center" });

    doc
      .fillColor("#94a3b8")
      .fontSize(13)
      .font("Helvetica")
      .text("for successfully mastering all curriculum requirements for the course", 0, 230, {
        align: "center",
      });

    // Course Title
    doc
      .fillColor("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(course?.title || "Professional Course", 60, 258, {
        align: "center",
        width: width - 120,
      });

    // Issue Date
    const issueDate = new Date(finalCert.issued_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc
      .fillColor("#94a3b8")
      .fontSize(12)
      .font("Helvetica")
      .text(`Issued on ${issueDate}`, 0, 325, { align: "center" });

    // Certificate Code (Bottom Left)
    doc
      .fillColor("#64748b")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("AUTHENTIC CREDENTIAL", 60, height - 110);
    doc
      .fillColor("#94a3b8")
      .fontSize(10)
      .font("Helvetica")
      .text(`Certificate ID: ${finalCert.certificate_code}`, 60, height - 95);

    // QR Code (Bottom Right)
    doc.image(qrBuffer, width - 145, height - 145, { width: 85, height: 85 });
    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font("Helvetica")
      .text("Scan QR to verify", width - 150, height - 55, {
        width: 95,
        align: "center",
      });

    doc.end();
  });
}
