import express from 'express';
import { processPayment, getTransactionHistory, updateSubscription } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { paymentValidation, validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', protect, paymentValidation, validate, processPayment);
router.post('/subscribe', protect, updateSubscription);
router.get('/history', protect, getTransactionHistory);

export default router;

