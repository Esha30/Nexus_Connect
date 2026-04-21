import express from 'express';
import { createMeeting, getUserMeetings, updateMeetingStatus } from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { meetingValidation, validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, meetingValidation, validate, createMeeting)
  .get(protect, getUserMeetings);

router.route('/:id/status')
  .put(protect, validateObjectId('id'), updateMeetingStatus);

export default router;

