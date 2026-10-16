'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import {
  getCheckoutStatus,
  initiateCheckout,
  mockPay,
} from '@/services/checkout.service';
import { Order, PaymentInitiateResult } from '@/types/order';

import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';
import { formatPrice } from '@/utils/format';

export default function MockPayPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentInitiateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');

  // Lấy đơn hàng + khởi tạo payment (backend tái dùng payment pending nên gọi nhiều lần vẫn an toàn)
  const setup = useCallback(
    async (showLoading: boolean) => {
      try {
        if (showLoading) setLoading(true);
        setError('');

        const status = await getCheckoutStatus(orderId);

        if (status.order.status === 'completed') {
          router.replace(`/checkout/result/${orderId}`);
          return;
        }
        if (status.order.status !== 'pending') {
          setError(
            `This order is ${status.order.status} and can no longer be paid.`,
          );
          return;
        }

        const init = await initiateCheckout(orderId, 'mock');
        setOrder(status.order);
        setPayment(init);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [orderId, router],
  );

  useEffect(() => {
    setup(true);
  }, [setup]);

  async function handlePay(shouldSucceed: boolean) {
    try {
      setPaying(true);
      setMessage('');

      const result = await mockPay(orderId, shouldSucceed);

      if (result.success) {
        router.replace(`/checkout/result/${orderId}`);
        return;
      }

      // Thất bại: đơn vẫn pending, tạo lại payment mới để user thử lại
      setMessage(result.message || 'Payment failed. Please try again.');
      await setup(false);
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <Loading text="Preparing payment..." />;
  }

  if (error || !order || !payment) {
    return (
      <div className="max-w-xl space-y-4">
        <ErrorState message={error || 'Unable to load payment.'} />
        <Link
          href="/orders"
          className="inline-block rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          Go to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        🧪 This is a <strong>sandbox payment page</strong>. No real money is
        charged.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Payment</h1>
        <p className="mt-1 text-sm text-slate-500">Order {order.order_code}</p>

        <ul className="mt-4 space-y-1 text-sm text-slate-700">
          {order.items?.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.course_title}</span>
              <span>{formatPrice(item.price)}</span>
            </li>
          ))}
        </ul>

        {order.discount_amount > 0 && (
          <div className="mt-2 flex justify-between text-sm text-emerald-700">
            <span>
              Discount {order.coupon_code ? `(${order.coupon_code})` : ''}
            </span>
            <span>-${order.discount_amount.toFixed(2)}</span>
          </div>
        )}

        <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold text-slate-900">
          <span>Total</span>
          <span>{formatPrice(payment.amount)}</span>
        </div>

        {payment.qrCodeData && (
          <div className="mt-6 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={payment.qrCodeData}
              alt="Payment QR code"
              className="h-48 w-48 rounded-lg border"
            />
            <p className="mt-2 text-xs text-slate-500">
              Demo QR code (for illustration only)
            </p>
          </div>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handlePay(true)}
            disabled={paying}
            className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {paying ? 'Processing...' : '✓ Simulate success'}
          </button>
          <button
            type="button"
            onClick={() => handlePay(false)}
            disabled={paying}
            className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            ✕ Simulate failure
          </button>
        </div>

        <Link
          href="/orders"
          className="mt-4 block text-center text-sm text-slate-500 underline hover:text-slate-800"
        >
          Pay later (view my orders)
        </Link>
      </div>
    </div>
  );
}
