import { Router } from 'express';
import {
  initiateCheckoutController,
  mockPayController,
} from '../controllers/checkout.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Initiate checkout (generates QR or mock checkout URL)
router.post('/initiate', initiateCheckoutController);

// Mock payment simulation (success / fail testing)
router.post('/mock-pay', mockPayController);

export default router;
