import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, validateObjectId('id'), markAsRead);
router.delete('/:id', protect, validateObjectId('id'), deleteNotification);
router.delete('/', protect, deleteAllNotifications);

export default router;
