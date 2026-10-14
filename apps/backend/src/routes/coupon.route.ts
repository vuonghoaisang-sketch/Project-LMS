import { Router } from 'express';
import {
  validateCouponController,
  listCouponsController,
  createCouponController,
} from '../controllers/coupon.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Validate coupon code against subtotal (available to authenticated users during checkout)
router.post('/validate', authMiddleware, validateCouponController);

// Manage coupons (Admin and Instructor)
router.get('/', authMiddleware, requireRole(['admin', 'instructor']), listCouponsController);
router.post('/', authMiddleware, requireRole(['admin']), createCouponController);

export default router;
