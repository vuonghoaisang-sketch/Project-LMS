'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { getCheckoutStatus } from '@/services/checkout.service';
import { CheckoutStatus } from '@/types/order';

import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';
import { formatPrice } from '@/utils/format';

const MAX_POLLS = 15; // 15 lần x 2 giây = 30 giây

export default function CheckoutResultPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);

  const [data, setData] = useState<CheckoutStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let tries = 0;

    async function poll() {
      try {
        const result = await getCheckoutStatus(orderId);
        if (!active) return;

        setData(result);
        setLoading(false);

        // Webhook có thể đến trễ: đơn còn pending thì hỏi lại sau 2 giây
        if (result.order.status === 'pending' && tries < MAX_POLLS) {
          tries += 1;
          timer = setTimeout(poll, 2000);
        }
      } catch (err) {
        if (!active) return;
        setError(getErrorMessage(err));
        setLoading(false);
      }
    }

    poll();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  if (loading) {
    return <Loading text="Checking payment status..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Unable to load order.'} />;
  }

  const { order } = data;
  const firstCourseId = order.items?.[0]?.course_id;

  return (
    <div className="max-w-xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {order.status === 'completed' && (
          <>
            <div className="text-5xl">🎉</div>
            <h1 className="mt-4 text-2xl font-bold text-emerald-700">
              Payment successful!
            </h1>
            <p className="mt-2 text-slate-600">
              Your course access has been activated.
            </p>
          </>
        )}

        {order.status === 'pending' && (
          <>
            <div className="text-5xl">⏳</div>
            <h1 className="mt-4 text-2xl font-bold text-amber-700">
              Waiting for payment confirmation
            </h1>
            <p className="mt-2 text-slate-600">
              We have not received the payment yet. This page refreshes
              automatically.
            </p>
          </>
        )}

        {(order.status === 'failed' || order.status === 'cancelled') && (
          <>
            <div className="text-5xl">❌</div>
            <h1 className="mt-4 text-2xl font-bold text-red-700">
              Order {order.status}
            </h1>
          </>
        )}

        <div className="mt-6 space-y-1 rounded-lg bg-slate-50 p-4 text-left text-sm text-slate-700">
          <div className="flex justify-between">
            <span>Order code</span>
            <span className="font-mono">{order.order_code}</span>
          </div>
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.course_title}</span>
              <span>{formatPrice(item.price)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {order.status === 'completed' && firstCourseId && (
            <Link
              href={`/courses/${firstCourseId}?from=my-courses`}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Start learning
            </Link>
          )}
          {order.status === 'pending' && (
            <Link
              href={`/checkout/mock-pay/${order.id}`}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Go to payment
            </Link>
          )}
          <Link
            href="/orders"
            className="rounded-xl border px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            My orders
          </Link>
        </div>
      </div>
    </div>
  );
}
