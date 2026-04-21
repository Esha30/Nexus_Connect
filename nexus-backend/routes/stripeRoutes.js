import express from 'express';
import { createCheckoutSession, verifySession, handleWebhook } from '../controllers/stripeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify-session/:sessionId', protect, verifySession);
router.post('/webhook', handleWebhook);

export default router;
