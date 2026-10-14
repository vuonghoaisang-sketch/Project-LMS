'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { verifyCertificate } from '@/services/certificate.service';
import { Certificate } from '@/types/certificate';
import Loading from '@/components/ui/Loading';

interface Props {
  params: Promise<{ code: string }>;
}

export default function VerifyCertificatePage({ params }: Props) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const { code } = await params;
        const res = await verifyCertificate(code);
        setCert(res.certificate);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [params]);

  if (loading) return <Loading text="Verifying certificate authenticity..." />;

  if (error || !cert) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 px-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
          ❌
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Certificate Not Found or Invalid
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The certificate credential code you entered does not exist or may have been revoked.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
        >
          Explore Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
      <div className="overflow-hidden rounded-3xl border-2 border-emerald-300 bg-white p-8 sm:p-10 shadow-xl">
        {/* Verification Stamp */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600 ring-8 ring-emerald-50">
            ✓
          </div>
          <span className="mt-4 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            Official Verified Credential
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Certificate of Completion
          </h1>
          <p className="mt-1 text-xs font-mono text-slate-400">
            ID: {cert.certificate_code}
          </p>
        </div>

        {/* Certificate Details */}
        <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-100 text-sm">
          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-500">Recipient Name</span>
            <span className="font-bold text-slate-900 text-base">{cert.user_name}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-500">Course Title</span>
            <span className="font-bold text-slate-900 text-right max-w-xs">{cert.course_title}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-500">Issue Date</span>
            <span className="font-semibold text-slate-800">
              {new Date(cert.issued_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Issuing Authority</span>
            <span className="font-semibold text-blue-700">LMS Platform Academic Board</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/courses"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Explore Platform Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
