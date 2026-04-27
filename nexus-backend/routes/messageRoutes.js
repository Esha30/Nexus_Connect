import express from 'express';
import { getConversations, getMessages, sendMessage, deleteMessage, editMessage, clearChat, toggleMuteChat, toggleArchiveChat, markAllRead, toggleBlockUser, reportUser } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.delete('/clear/:partnerId', protect, validateObjectId('partnerId'), clearChat);
router.put('/mute/:partnerId', protect, validateObjectId('partnerId'), toggleMuteChat);
router.put('/archive/:partnerId', protect, validateObjectId('partnerId'), toggleArchiveChat);
router.put('/read/:partnerId', protect, validateObjectId('partnerId'), markAllRead);
router.get('/:userId', protect, validateObjectId('userId'), getMessages);
router.put('/block/:partnerId', protect, validateObjectId('partnerId'), toggleBlockUser);
router.post('/report', protect, reportUser);
router.post('/', protect, sendMessage);
router.delete('/:id', protect, validateObjectId('id'), deleteMessage);
router.put('/:id', protect, validateObjectId('id'), editMessage);

export default router;
