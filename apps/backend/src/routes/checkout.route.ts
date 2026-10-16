import { Router } from "express";
import {
  initiateCheckoutController,
  mockPayController,
  paymentWebhookController,
  checkoutStatusController,
} from "../controllers/checkout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// ⚠️ Webhook phải đặt TRƯỚC authMiddleware, vì cổng thanh toán không có token của user
router.post("/webhook/:provider", paymentWebhookController);

router.use(authMiddleware);

router.post("/initiate", initiateCheckoutController);
router.post("/mock-pay", mockPayController);
router.get("/status/:orderId", checkoutStatusController);

export default router;
