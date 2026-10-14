import crypto from 'node:crypto';
import {
  createOrder,
  findOrderById,
  findOrderByCode,
  getUserOrders,
  updateOrderStatus,
} from '../models/order.model';
import { findCourseById } from '../models/course.model';
import { findEnrollment, createEnrollment } from '../models/enrollment.model';
import { validateCoupon, markCouponUsed } from './coupon.service';
import { createNotification } from '../models/notification.model';
import { Order } from '../types/order.types';
import AppError from '../utils/AppError';

function generateOrderCode(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${dateStr}-${rand}`;
}

export async function createCourseOrder(
  userId: number,
  courseId: number,
  couponCode?: string
): Promise<Order> {
  const course = await findCourseById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if student already enrolled
  const existingEnrollment = await findEnrollment(userId, courseId);
  if (existingEnrollment) {
    throw new AppError('You are already enrolled in this course', 400);
  }

  const subtotal = Number(course.price) || 0;
  let discountAmount = 0;
  let couponId: number | null = null;
  let totalAmount = subtotal;

  // Apply Coupon if provided and subtotal > 0
  if (couponCode && couponCode.trim() && subtotal > 0) {
    const valResult = await validateCoupon(couponCode, subtotal);
    discountAmount = valResult.discount_amount;
    couponId = valResult.coupon.id;
    totalAmount = valResult.final_total;
  }

  const orderCode = generateOrderCode();

  // If free course or 100% discount, immediately complete order and enroll
  if (totalAmount === 0) {
    const order = await createOrder({
      order_code: orderCode,
      user_id: userId,
      subtotal,
      discount_amount: discountAmount,
      coupon_id: couponId,
      total_amount: 0,
      status: 'completed',
      items: [{ course_id: courseId, price: subtotal }],
    });

    if (couponId) {
      await markCouponUsed(couponId);
    }

    // Auto-enroll user
    await createEnrollment(userId, courseId);

    await createNotification({
      user_id: userId,
      type: 'order_completed',
      message: `Enrolled successfully in '${course.title}' (Free Access).`,
      reference_id: order.id,
      reference_type: 'order',
    });

    return order;
  }

  // Paid order in pending status awaiting payment
  const order = await createOrder({
    order_code: orderCode,
    user_id: userId,
    subtotal,
    discount_amount: discountAmount,
    coupon_id: couponId,
    total_amount: totalAmount,
    status: 'pending',
    items: [{ course_id: courseId, price: subtotal }],
  });

  return order;
}

export async function getMyOrdersList(userId: number) {
  return getUserOrders(userId);
}

export async function getOrderDetails(orderId: number, userId: number, role: string) {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user_id !== userId && role !== 'admin') {
    throw new AppError('You do not have permission to view this order', 403);
  }

  return order;
}

export async function cancelUserOrder(orderId: number, userId: number) {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user_id !== userId) {
    throw new AppError('You can only cancel your own order', 403);
  }

  if (order.status !== 'pending') {
    throw new AppError(`Cannot cancel an order that is already ${order.status}`, 400);
  }

  await updateOrderStatus(orderId, 'cancelled');
  return { success: true, message: 'Order has been cancelled' };
}
