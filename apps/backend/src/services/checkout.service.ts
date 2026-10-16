import { findOrderById, findOrderByCode } from "../models/order.model";
import {
  findPaymentsByOrderId,
  settlePaymentTx,
} from "../models/payment.model";
import { createEnrollment, findEnrollment } from "../models/enrollment.model";
import { createNotification } from "../models/notification.model";
import { PaymentGatewayFactory } from "./payment/payment-gateway.factory";
import { PaymentWebhookEvent } from "./payment/payment-gateway.interface";
import { buildMockWebhook } from "./payment/mock-payment.provider";
import { isMockPaymentEnabled } from "../config/payment";
import { Order, PaymentMethod } from "../types/order.types";
import AppError from "../utils/AppError";

// ---------- Helpers ----------

async function getOwnedOrder(orderId: number, userId: number): Promise<Order> {
  const order = await findOrderById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.user_id !== userId) {
    throw new AppError("You do not have permission to access this order", 403);
  }
  return order;
}

// Ghi danh tất cả khoá học trong đơn. Gọi nhiều lần vẫn an toàn (idempotent)
async function fulfillOrder(order: Order) {
  for (const item of order.items || []) {
    const already = await findEnrollment(order.user_id, item.course_id);
    if (!already) {
      await createEnrollment(order.user_id, item.course_id);
    }
  }
}

// Tìm payment tương ứng với sự kiện webhook
async function resolvePaymentId(event: PaymentWebhookEvent): Promise<number> {
  if (event.paymentId) return event.paymentId;

  // Cổng chỉ gửi mã đơn (kiểu SePay/VietQR)
  if (event.orderCode) {
    const order = await findOrderByCode(event.orderCode);
    if (order) {
      const payments = await findPaymentsByOrderId(order.id);
      const pending = payments.find((p) => p.status === "pending");
      if (pending) return pending.id;
    }
  }
  throw new AppError("Payment not found for this webhook event", 404);
}

// ---------- 1. Bắt đầu thanh toán ----------

export async function initiateCheckout(
  orderId: number,
  userId: number,
  paymentMethod: PaymentMethod = "mock",
) {
  const order = await getOwnedOrder(orderId, userId);

  if (order.status === "completed") {
    throw new AppError("This order has already been paid and completed", 400);
  }
  if (order.status !== "pending") {
    throw new AppError(
      `Cannot pay an order with status '${order.status}'`,
      400,
    );
  }

  const gateway = PaymentGatewayFactory.get(paymentMethod);
  return gateway.initiate(order, userId);
}

// ---------- 2. Xử lý webhook (ĐƯỜNG DUY NHẤT kích hoạt khoá học) ----------

export async function handlePaymentWebhook(
  provider: PaymentMethod,
  headers: Record<string, any>,
  body: any,
) {
  const gateway = PaymentGatewayFactory.get(provider);
  const event = gateway.verifyWebhook(headers, body); // sai chữ ký => throw 401

  const paymentId = await resolvePaymentId(event);

  const result = await settlePaymentTx({
    paymentId,
    status: event.status,
    transactionId: event.transactionId,
    paidAmount: event.amount,
    metadata: { provider, event: event.raw },
  });

  if (result.outcome === "not_found")
    throw new AppError("Payment not found", 404);
  if (result.outcome === "amount_mismatch")
    throw new AppError("Payment amount does not match", 400);

  const order = (await findOrderById(result.orderId))!;

  if (result.outcome === "completed") {
    await fulfillOrder(order);

    if (result.newlyCompleted) {
      await createNotification({
        user_id: order.user_id,
        type: "order_completed",
        message: `Payment successful for order ${order.order_code}! Your course access is activated.`,
        reference_id: order.id,
        reference_type: "order",
      });
    }
  }

  const success =
    result.outcome === "completed" ||
    (result.outcome === "already_processed" && order.status === "completed");

  return {
    success,
    alreadyProcessed: result.outcome === "already_processed",
    transactionId: event.transactionId,
    order,
    message: success
      ? "Payment completed successfully! You can now start learning."
      : "Payment failed. You can try again.",
  };
}

// ---------- 3. Giả lập cổng (CHỈ dùng khi dev) ----------

export async function simulateMockPayment(
  orderId: number,
  userId: number,
  shouldSucceed: boolean = true,
) {
  if (!isMockPaymentEnabled()) {
    throw new AppError("Mock payment is disabled in this environment", 403);
  }

  const order = await getOwnedOrder(orderId, userId);

  if (order.status === "completed") {
    return {
      success: true,
      alreadyProcessed: true,
      order,
      message: "This order was already completed.",
    };
  }
  if (order.status !== "pending") {
    throw new AppError(
      `Cannot pay an order with status '${order.status}'`,
      400,
    );
  }

  const payments = await findPaymentsByOrderId(orderId);
  const payment = payments.find(
    (p) => p.status === "pending" && p.payment_method === "mock",
  );
  if (!payment) {
    throw new AppError(
      "No pending payment found. Please call /checkout/initiate first",
      400,
    );
  }

  // Giả làm cổng: tạo webhook có chữ ký rồi đẩy vào ĐÚNG đường xử lý webhook thật
  const { headers, body } = buildMockWebhook(payment, order, shouldSucceed);
  return handlePaymentWebhook("mock", headers, body);
}

// ---------- 4. Frontend hỏi trạng thái (polling) ----------

export async function getCheckoutStatus(orderId: number, userId: number) {
  const order = await getOwnedOrder(orderId, userId);

  // Tự chữa lành: đơn đã completed mà lỡ chưa ghi danh xong thì ghi danh bù
  if (order.status === "completed") {
    await fulfillOrder(order);
  }

  const payments = await findPaymentsByOrderId(orderId);
  return { order, payment: payments[0] ?? null };
}
