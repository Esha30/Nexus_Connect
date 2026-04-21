import Document from '../models/Document.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const document = new Document({
      uploader: req.user._id,
      title: req.body.title || req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileType: req.file.mimetype,
      project: req.body.project || 'General',
      category: req.body.category || 'other'
    });

    const savedDoc = await document.save();
    res.status(201).json(savedDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error saving document', error: error.message });
  }
};

// @desc    Get user's documents and documents shared with them
// @route   GET /api/documents
// @access  Private
export const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { uploader: req.user._id },
        { sharedWith: req.user._id }
      ]
    })
      .populate('uploader', 'name email profile')
      .sort({ createdAt: -1 })
      .lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

// @desc    Share a document with users
// @route   POST /api/documents/:id/share
// @access  Private
export const shareDocument = async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs to share with
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the uploader can share this document' });
    }

    document.sharedWith = userIds;
    await document.save();

    res.json({ message: 'Access permissions updated successfully', sharedWith: document.sharedWith });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing document', error: error.message });
  }
};

// @desc    Update document status / Add signature
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only the uploader can update their document
    if (document.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }

    if (req.body.status) {
      document.status = req.body.status;
    }

    // Handle base64 E-Signature
    if (req.body.eSignatureUrl && req.body.eSignatureUrl.startsWith('data:image')) {
      const base64Data = req.body.eSignatureUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const sigFileName = `sig_${document._id}_${Date.now()}.png`;
      const sigDir = path.join(process.cwd(), 'uploads', 'signatures');
      
      // Ensure directory exists
      if (!existsSync(sigDir)) {
        await fs.mkdir(sigDir, { recursive: true });
      }
      
      const sigPath = path.join(sigDir, sigFileName);
      await fs.writeFile(sigPath, buffer);
      
      document.eSignatureUrl = `/uploads/signatures/${sigFileName}`;
      document.status = 'signed';
    } else if (req.body.eSignatureUrl) {
      document.eSignatureUrl = req.body.eSignatureUrl;
      document.status = 'signed';
    }

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only the uploader can delete their document
    if (document.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Remove the physical file from disk
    const filePath = path.join(process.cwd(), document.filePath.replace(/^\//, ''));
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};
