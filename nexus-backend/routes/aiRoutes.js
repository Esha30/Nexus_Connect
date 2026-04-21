import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { handleCopilotChat, generateSynergy, generateElevatorPitch, generateTermSheet, verifyAiConnection, generateMessageDraft } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);

router.post('/chat', handleCopilotChat);
router.post('/synergy', generateSynergy);
router.post('/pitch', generateElevatorPitch);
router.post('/termsheet', generateTermSheet);
router.post('/draft', generateMessageDraft);
router.get('/test-connection', verifyAiConnection);


export default router;
