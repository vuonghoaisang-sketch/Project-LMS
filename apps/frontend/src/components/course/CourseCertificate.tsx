'use client';

import { useState } from 'react';
import { Certificate } from '@/types/certificate';
import {
  claimCertificate,
  getCertificateDownloadUrl,
} from '@/services/certificate.service';
import { getErrorMessage } from '@/utils/error';

interface CourseCertificateProps {
  courseId: number;
  initialCertificate?: Certificate | null;
  progressPercent: number;
}

export default function CourseCertificate({
  courseId,
  initialCertificate,
  progressPercent,
}: CourseCertificateProps) {
  const [cert, setCert] = useState<Certificate | null>(initialCertificate || null);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  if (progressPercent < 100) return null;

  async function handleClaim() {
    try {
      setClaiming(true);
      setError('');
      const res = await claimCertificate(courseId);
      setCert(res.certificate);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setClaiming(false);
    }
  }

  const downloadUrl = getCertificateDownloadUrl(courseId);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-3xl text-white shadow-md">
            🎓
          </div>
          <div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              100% Curriculum Completed
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Official Course Completion Certificate
            </h3>
            <p className="text-xs text-slate-600">
              You have completed all requirements and are eligible for an accredited certificate with QR verification.
            </p>
          </div>
        </div>

        <div>
          {cert ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:from-amber-700 hover:to-amber-800 transition"
              >
                <span>Download PDF Certificate ↓</span>
              </a>

              <a
                href={`/verify-certificate/${cert.certificate_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-4 py-2 text-xs font-bold text-amber-900 shadow-sm hover:bg-amber-50 transition"
              >
                <span>Verify Credential ↗</span>
              </a>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="rounded-xl bg-amber-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-amber-700 transition disabled:opacity-50"
            >
              {claiming ? 'Generating Certificate...' : 'Claim Certificate Now 🏅'}
            </button>
          )}
        </div>
      </div>

      {cert && (
        <div className="mt-4 pt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between text-xs text-amber-950 font-mono">
          <span>Certificate ID: {cert.certificate_code}</span>
          <span className="text-slate-500 font-sans">
            Issued on {new Date(cert.issued_at).toLocaleDateString()}
          </span>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
