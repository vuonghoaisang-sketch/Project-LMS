'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { getCourseById } from '@/services/course.service';
import { checkEnrollment } from '@/services/enrollment.service';
import { createOrder } from '@/services/order.service';
import { validateCoupon } from '@/services/coupon.service';

import { Course } from '@/types/course';
import { CouponValidation } from '@/types/order';
import { useAuth } from '@/context/AuthContext';

import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';
import { formatPrice } from '@/utils/format';

export default function CheckoutCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [applied, setApplied] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const data = await getCourseById(courseId);
        setCourse(data);

        if (user?.role === 'student') {
          const enrollment = await checkEnrollment(courseId);
          if (enrollment.enrolled) {
            router.replace(`/courses/${courseId}`);
            return;
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId, user, authLoading, router]);

  async function handleApplyCoupon() {
    if (!course || !couponInput.trim()) return;

    try {
      setApplying(true);
      setCouponError('');
      const result = await validateCoupon(
        couponInput.trim(),
        Number(course.price),
      );
      setApplied(result);
    } catch (err) {
      setApplied(null);
      setCouponError(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  }

  function handleRemoveCoupon() {
    setApplied(null);
    setCouponInput('');
    setCouponError('');
  }

  async function handleContinue() {
    if (!course) return;

    try {
      setSubmitting(true);
      setSubmitError('');

      const order = await createOrder(
        course.id,
        applied ? couponInput.trim() : undefined,
      );

      if (order.status === 'completed') {
        router.replace(`/checkout/result/${order.id}`);
      } else {
        router.push(`/checkout/mock-pay/${order.id}`);
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return <Loading text="Loading checkout..." />;
  }

  if (error || !course) {
    return <ErrorState message={error || 'Course not found.'} />;
  }

  if (user && user.role !== 'student') {
    return <ErrorState message="Only students can purchase courses." />;
  }

  const price = Number(course.price) || 0;
  const total = applied ? applied.final_total : price;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href={`/courses/${course.id}`}
        className="inline-block rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        ← Back to course
      </Link>

      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{course.title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {course.instructor_name || 'LMS Instructor'}
        </p>

        <div className="mt-6 border-t pt-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Coupon code
          </label>

          {applied ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span>{applied.message}</span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="font-semibold underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter code"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={applying || !couponInput.trim()}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {applying ? 'Checking...' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && (
            <p className="mt-2 text-sm text-red-600">{couponError}</p>
          )}
        </div>

        <div className="mt-6 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Price</span>
            <span>{formatPrice(price)}</span>
          </div>
          {applied && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-${applied.discount_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {submitError && (
          <p className="mt-4 text-sm text-red-600">{submitError}</p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting
            ? 'Processing...'
            : total === 0
              ? 'Enroll now'
              : 'Continue to payment'}
        </button>
      </div>
    </div>
  );
}
