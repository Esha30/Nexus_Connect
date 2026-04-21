import express from 'express';
import { getDeals, createDeal, updateDeal } from '../controllers/dealController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDeals);
router.post('/', protect, createDeal);
router.put('/:id', protect, updateDeal);

export default router;
