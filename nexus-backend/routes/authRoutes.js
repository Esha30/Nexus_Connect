import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  setup2FA,
  confirm2FA,
  verifyOTP, 
  googleLogin,
  forgotPassword,
  resetPassword,
  getPublicProfile,
  getEntrepreneurs,
  getInvestors,
  requestPriorityAccess,
  endorseStartup
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { registerValidation, loginValidation, validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.post('/google-login', googleLogin);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.get('/profile/:id', protect, validateObjectId('id'), getPublicProfile);
router.get('/investor/:id', protect, validateObjectId('id'), getPublicProfile);
router.get('/entrepreneur/:id', protect, validateObjectId('id'), getPublicProfile);
router.get('/entrepreneurs', protect, getEntrepreneurs);
router.post('/endorse', protect, endorseStartup);
router.get('/investors', protect, getInvestors);
router.post('/priority-access', protect, requestPriorityAccess);
router.post('/setup-2fa', protect, setup2FA);
router.post('/confirm-2fa', protect, confirm2FA);

export default router;


