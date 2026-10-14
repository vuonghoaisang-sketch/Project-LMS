import { Router } from 'express';
import {
  createOrderController,
  getMyOrdersController,
  getOrderDetailsController,
  cancelOrderController,
} from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createOrderController);
router.get('/', getMyOrdersController);
router.get('/:id', getOrderDetailsController);
router.post('/:id/cancel', cancelOrderController);

export default router;
