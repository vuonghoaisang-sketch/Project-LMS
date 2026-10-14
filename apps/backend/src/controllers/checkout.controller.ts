import { Request, Response } from 'express';
import { initiateCheckout, processMockPayment } from '../services/checkout.service';
import { PaymentMethod } from '../types/order.types';

export async function initiateCheckoutController(req: Request, res: Response) {
  const user = (req as any).user;
  const { order_id, payment_method } = req.body;

  if (!order_id) {
    return res.status(400).json({ success: false, message: 'order_id is required' });
  }

  const result = await initiateCheckout(
    Number(order_id),
    user.id,
    (payment_method as PaymentMethod) || 'mock'
  );

  return res.json({ success: true, ...result });
}

export async function mockPayController(req: Request, res: Response) {
  const user = (req as any).user;
  const { order_id, should_succeed } = req.body;

  if (!order_id) {
    return res.status(400).json({ success: false, message: 'order_id is required' });
  }

  const result = await processMockPayment(
    Number(order_id),
    user.id,
    should_succeed !== false
  );

  return res.json({ ...result });
}
