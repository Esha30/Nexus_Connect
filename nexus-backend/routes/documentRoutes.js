import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadDocument, getUserDocuments, updateDocument, deleteDocument, shareDocument } from '../controllers/documentController.js';
import { analyzePitchDeck } from '../controllers/aiDocumentController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/documents';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir); 
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const allowedExtensions = /pdf|doc|docx|jpeg|jpg|png/;
  const allowedMimeTypes = /pdf|jpeg|jpg|png|msword|vnd\.openxmlformats-officedocument/;
  
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, and images (jpg, jpeg, png) are allowed'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Robust wrapper to intercept Multer HTML crash traces into clean JSON
const handleUpload = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      console.warn('[UPLOAD_ERROR]', err.message);
      return res.status(400).json({ message: err.message, error: 'FILE_UPLOAD_ERROR' });
    }
    next();
  });
};

router.route('/')
  .post(protect, handleUpload, uploadDocument)
  .get(protect, getUserDocuments);

router.route('/:id')
  .put(protect, validateObjectId('id'), updateDocument)
  .delete(protect, validateObjectId('id'), deleteDocument);

router.post('/:id/share', protect, validateObjectId('id'), shareDocument);
router.post('/:id/analyze', protect, validateObjectId('id'), analyzePitchDeck);

export default router;
