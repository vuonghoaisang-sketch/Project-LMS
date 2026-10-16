import { Request, Response } from "express";
import {
  initiateCheckout,
  simulateMockPayment,
  handlePaymentWebhook,
  getCheckoutStatus,
} from "../services/checkout.service";
import { PaymentMethod } from "../types/order.types";

export async function initiateCheckoutController(req: Request, res: Response) {
  const user = (req as any).user;
  const { order_id, payment_method } = req.body;

  if (!order_id) {
    return res
      .status(400)
      .json({ success: false, message: "order_id is required" });
  }

  const result = await initiateCheckout(
    Number(order_id),
    user.id,
    (payment_method as PaymentMethod) || "mock",
  );

  return res.json({ success: true, ...result });
}

// Chỉ dùng khi dev: trang "ngân hàng giả" gọi vào đây
export async function mockPayController(req: Request, res: Response) {
  const user = (req as any).user;
  const { order_id, should_succeed } = req.body;

  if (!order_id) {
    return res
      .status(400)
      .json({ success: false, message: "order_id is required" });
  }

  const result = await simulateMockPayment(
    Number(order_id),
    user.id,
    should_succeed !== false,
  );
  return res.json(result);
}

// Webhook: KHÔNG có user đăng nhập, bảo mật bằng chữ ký
export async function paymentWebhookController(req: Request, res: Response) {
  const provider = req.params.provider as PaymentMethod;
  const result = await handlePaymentWebhook(provider, req.headers, req.body);

  // Mỗi cổng thật yêu cầu định dạng phản hồi riêng
  // (VD VNPay cần { RspCode: '00', Message: 'Confirm Success' }). Lúc đó chỉnh ở đây.
  return res.json({ success: result.success });
}

export async function checkoutStatusController(req: Request, res: Response) {
  const user = (req as any).user;
  const result = await getCheckoutStatus(Number(req.params.orderId), user.id);
  return res.json({ success: true, ...result });
}
