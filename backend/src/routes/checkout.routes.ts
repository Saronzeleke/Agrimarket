import { Router } from 'express';
import { checkoutController } from '../controllers/checkout.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';
import { orderCreationLimiter } from '../middleware/rate-limit.middleware';

const router = Router();
// All checkout routes require authentication

// Get checkout summary
router.get('/summary', authenticate, asyncHandler(checkoutController.getCheckoutSummary));

// Get payment methods
router.get('/payment-methods', authenticate, asyncHandler(checkoutController.getPaymentMethods));

// Process checkout (with rate limiting to prevent abuse)
router.post('/', authenticate, orderCreationLimiter, asyncHandler(checkoutController.processCheckout));

export default router;
