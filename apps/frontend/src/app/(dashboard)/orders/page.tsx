'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { cancelOrder, getMyOrders } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order';

import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';
import { formatDateTime, formatPrice } from '@/utils/format';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleCancel(orderId: number) {
    if (!confirm('Cancel this order?')) return;

    try {
      setCancellingId(orderId);
      await cancelOrder(orderId);
      await loadOrders();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return <Loading text="Loading your orders..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you purchase a course, your orders will appear here."
        action={
          <Link
            href="/courses"
            className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Browse courses
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-sm font-semibold text-slate-900">
                  {order.order_code}
                </div>
                <div className="text-xs text-slate-500">
                  {formatDateTime(order.created_at)}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {order.items?.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <Link
                    href={`/courses/${item.course_id}`}
                    className="hover:text-blue-700 hover:underline"
                  >
                    {item.course_title}
                  </Link>
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

            <div className="mt-3 flex justify-between border-t pt-3 font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>

            {order.status === 'pending' && (
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/checkout/mock-pay/${order.id}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Pay now
                </Link>
                <button
                  type="button"
                  onClick={() => handleCancel(order.id)}
                  disabled={cancellingId === order.id}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
