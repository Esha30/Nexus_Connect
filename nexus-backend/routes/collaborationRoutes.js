import express from 'express';
import { createCollaboration, getMyCollaborations, updateCollaborationStatus } from '../controllers/collaborationController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .post(protect, createCollaboration)
  .get(protect, getMyCollaborations);

router.route('/:id/status')
  .put(protect, validateObjectId('id'), updateCollaborationStatus);

export default router;
