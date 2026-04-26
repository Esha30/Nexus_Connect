import express from 'express';
import { protect, adminAuth } from '../middleware/authMiddleware.js';
import { 
  getSupportTickets, 
  resolveTicket,
  getPendingPriority,
  approvePriority,
  getAdminStats,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllPosts,
  deletePost,
  updateUserStatus,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs
} from '../controllers/adminController.js';

const router = express.Router();

// Apply protect and adminAuth middleware to all routes
router.use(protect);
router.use(adminAuth);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);
router.get('/tickets', getSupportTickets);
router.put('/tickets/:id', resolveTicket);
router.get('/priority', getPendingPriority);
router.put('/priority/:id', approvePriority);
router.put('/users/:id/status', updateUserStatus);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/logs', getAuditLogs);

export default router;
