import { Order, PaymentMethod } from "../../types/order.types";

export interface PaymentInitiateResult {
  paymentId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  checkoutUrl?: string;
  qrCodeData?: string;
  extra?: Record<string, any>;
}

// Sự kiện đã được chuẩn hoá: cổng nào cũng quy về dạng này
export interface PaymentWebhookEvent {
  paymentId?: number; // cổng nào trả về paymentId thì điền
  orderCode?: string; // cổng chuyển khoản (SePay/VietQR) thường chỉ có mã đơn
  transactionId: string;
  amount: number;
  status: "completed" | "failed";
  raw: unknown; // dữ liệu gốc để lưu log vào payments.metadata
}

export interface IPaymentGateway {
  name: PaymentMethod;

  // Tạo giao dịch, trả về URL/QR để user thanh toán
  initiate(
    order: Order,
    userId: number,
    metadata?: any,
  ): Promise<PaymentInitiateResult>;

  // Kiểm tra chữ ký + chuẩn hoá dữ liệu webhook. Sai chữ ký thì throw AppError 401
  verifyWebhook(headers: Record<string, any>, body: any): PaymentWebhookEvent;
}
