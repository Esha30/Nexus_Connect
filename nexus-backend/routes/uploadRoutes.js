import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to the uploads directory mapped in server.js
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// @desc    Upload file for profile avatars or generic assets
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Construct accessible URL
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
  });
});

// @desc    Upload file for chat messages
// @route   POST /api/upload/chat
// @access  Private
router.post('/chat', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Construct accessible URL
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
  });
});

export default router;
