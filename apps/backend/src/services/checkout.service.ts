import { findOrderById, updateOrderStatus } from '../models/order.model';
import { findPaymentsByOrderId, createPaymentRecord } from '../models/payment.model';
import { createEnrollment, findEnrollment } from '../models/enrollment.model';
import { markCouponUsed } from './coupon.service';
import { createNotification } from '../models/notification.model';
import { PaymentGatewayFactory } from './payment/payment-gateway.factory';
import { PaymentMethod } from '../types/order.types';
import AppError from '../utils/AppError';

export async function initiateCheckout(
  orderId: number,
  userId: number,
  paymentMethod: PaymentMethod = 'mock'
) {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user_id !== userId) {
    throw new AppError('You do not have permission to pay for this order', 403);
  }

  if (order.status === 'completed') {
    throw new AppError('This order has already been paid and completed', 400);
  }

  if (order.status === 'cancelled') {
    throw new AppError('This order was cancelled', 400);
  }

  const gateway = PaymentGatewayFactory.get(paymentMethod);
  const result = await gateway.initiate(order, userId);
  return result;
}

export async function processMockPayment(
  orderId: number,
  userId: number,
  shouldSucceed: boolean = true
) {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user_id !== userId) {
    throw new AppError('You do not have permission to pay for this order', 403);
  }

  if (order.status === 'completed') {
    return {
      success: true,
      order,
      message: 'This order was already completed.',
    };
  }

  // Get or create payment record
  let payments = await findPaymentsByOrderId(orderId);
  let payment = payments.find((p) => p.status === 'pending');
  if (!payment) {
    payment = await createPaymentRecord({
      order_id: order.id,
      user_id: userId,
      amount: order.total_amount,
      payment_method: 'mock',
      status: 'pending',
    });
  }

  const gateway = PaymentGatewayFactory.get('mock');
  const result = await gateway.process(order, payment.id, { shouldSucceed });

  if (result.success) {
    // 1. Mark Order Completed
    await updateOrderStatus(orderId, 'completed');

    // 2. Automatically enroll student in all courses in this order
    for (const item of order.items || []) {
      const already = await findEnrollment(userId, item.course_id);
      if (!already) {
        await createEnrollment(userId, item.course_id);
      }
    }

    // 3. Increment coupon usage if used
    if (order.coupon_id) {
      await markCouponUsed(order.coupon_id);
    }

    // 4. Send notification
    await createNotification({
      user_id: userId,
      type: 'order_completed',
      message: `Payment successful for order ${order.order_code}! Your course access is activated.`,
      reference_id: order.id,
      reference_type: 'order',
    });

    const updatedOrder = await findOrderById(orderId);
    return {
      success: true,
      transactionId: result.transactionId,
      order: updatedOrder,
      message: 'Payment completed successfully! You can now start learning.',
    };
  } else {
    await updateOrderStatus(orderId, 'failed');
    return {
      success: false,
      transactionId: result.transactionId,
      order: await findOrderById(orderId),
      message: result.message || 'Payment failed.',
    };
  }
}
