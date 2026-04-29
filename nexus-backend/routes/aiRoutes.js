import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { handleCopilotChat, generateSynergy, generateElevatorPitch, generateTermSheet, verifyAiConnection, generateMessageDraft, generateMarketSentiment } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);

router.post('/chat', handleCopilotChat);
router.post('/synergy', generateSynergy);
router.post('/pitch', generateElevatorPitch);
router.post('/termsheet', generateTermSheet);
router.post('/draft', generateMessageDraft);
router.get('/sentiment', generateMarketSentiment);
router.get('/test-connection', verifyAiConnection);


export default router;
