import crypto from "node:crypto";
import QRCode from "qrcode";
import {
  IPaymentGateway,
  PaymentInitiateResult,
  PaymentWebhookEvent,
} from "./payment-gateway.interface";
import { Order, Payment, PaymentMethod } from "../../types/order.types";
import {
  createPaymentRecord,
  findPaymentsByOrderId,
} from "../../models/payment.model";
import { getMockPaymentSecret } from "../../config/payment";
import AppError from "../../utils/AppError";

const SIGNATURE_HEADER = "x-mock-signature";

// Ký chuỗi chuẩn hoá (giống cách VNPay/MoMo ký: nối các trường rồi HMAC)
function signMockPayload(p: {
  payment_id: number;
  order_code: string;
  amount: number;
  status: string;
  transaction_id: string;
}): string {
  const data = [
    p.payment_id,
    p.order_code,
    p.amount,
    p.status,
    p.transaction_id,
  ].join("|");
  return crypto
    .createHmac("sha256", getMockPaymentSecret())
    .update(data)
    .digest("hex");
}

// Đóng vai "cổng thanh toán": tạo webhook có chữ ký như cổng thật sẽ gửi
export function buildMockWebhook(
  payment: Payment,
  order: Order,
  shouldSucceed: boolean,
) {
  const body = {
    payment_id: payment.id,
    order_code: order.order_code,
    amount: Number(payment.amount),
    status: shouldSucceed ? "success" : "failed",
    transaction_id: `MOCK-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
  };
  return { headers: { [SIGNATURE_HEADER]: signMockPayload(body) }, body };
}

export class MockPaymentProvider implements IPaymentGateway {
  name: PaymentMethod = "mock";

  async initiate(
    order: Order,
    userId: number,
    metadata?: any,
  ): Promise<PaymentInitiateResult> {
    // Tái dùng payment đang pending (không tạo thêm mỗi lần gọi)
    const existing = await findPaymentsByOrderId(order.id);
    let payment = existing.find(
      (p) => p.status === "pending" && p.payment_method === "mock",
    );

    if (!payment) {
      const txnRef = `MOCK-TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      payment = await createPaymentRecord({
        order_id: order.id,
        user_id: userId,
        amount: order.total_amount,
        payment_method: "mock",
        transaction_id: txnRef,
        status: "pending",
        metadata: {
          provider: "Mock Payment Sandbox (Simulation)",
          ...metadata,
        },
      });
    }

    // QR giả lập cho giống VietQR
    const mockQrPayload = `2|99|0901234567|LMS Platform||0|0|${order.total_amount}|${order.order_code}|transfer_p2p`;
    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(mockQrPayload, {
        margin: 1,
        width: 200,
      });
    } catch {
      qrDataUrl = "";
    }

    return {
      paymentId: payment.id,
      paymentMethod: "mock",
      amount: order.total_amount,
      checkoutUrl: `/checkout/mock-pay/${order.id}`, // route FRONTEND
      qrCodeData: qrDataUrl,
      extra: {
        transactionId: payment.transaction_id,
        orderCode: order.order_code,
      },
    };
  }

  verifyWebhook(headers: Record<string, any>, body: any): PaymentWebhookEvent {
    const received = Buffer.from(String(headers[SIGNATURE_HEADER] ?? ""));
    const expected = Buffer.from(signMockPayload(body ?? {}));

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      throw new AppError("Invalid webhook signature", 401);
    }

    return {
      paymentId: Number(body.payment_id),
      orderCode: body.order_code,
      transactionId: String(body.transaction_id),
      amount: Number(body.amount),
      status: body.status === "success" ? "completed" : "failed",
      raw: body,
    };
  }
}
