import { Request, Response } from 'express';
import {
  createCourseOrder,
  getMyOrdersList,
  getOrderDetails,
  cancelUserOrder,
} from '../services/order.service';

export async function createOrderController(req: Request, res: Response) {
  const user = (req as any).user;
  const { course_id, coupon_code } = req.body;

  if (!course_id) {
    return res.status(400).json({ success: false, message: 'course_id is required' });
  }

  const order = await createCourseOrder(
    user.id,
    Number(course_id),
    coupon_code ? String(coupon_code) : undefined
  );

  return res.status(201).json({
    success: true,
    message: order.status === 'completed' ? 'Course enrolled directly' : 'Order created successfully',
    order,
  });
}

export async function getMyOrdersController(req: Request, res: Response) {
  const user = (req as any).user;
  const orders = await getMyOrdersList(user.id);
  return res.json({ success: true, orders });
}

export async function getOrderDetailsController(req: Request, res: Response) {
  const user = (req as any).user;
  const orderId = Number(req.params.id);
  const order = await getOrderDetails(orderId, user.id, user.role);
  return res.json({ success: true, order });
}

export async function cancelOrderController(req: Request, res: Response) {
  const user = (req as any).user;
  const orderId = Number(req.params.id);
  const result = await cancelUserOrder(orderId, user.id);
  return res.json({ ...result });
}
