import express from 'express';
import { protect, adminAuth } from '../middleware/authMiddleware.js';
import { 
  getSupportTickets, 
  resolveTicket,
  getPendingPriority,
  approvePriority
} from '../controllers/adminController.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Apply adminAuth middleware to all routes (we will create this)
router.use(adminAuth);

router.get('/tickets', getSupportTickets);
router.put('/tickets/:id', resolveTicket);
router.get('/priority', getPendingPriority);
router.put('/priority/:id', approvePriority);

export default router;
