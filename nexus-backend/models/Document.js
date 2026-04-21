import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  project: {
    type: String, // Or could be a ref to a Deal/Project model later
  },
  title: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String, // e.g. application/pdf
  },
  category: {
    type: String,
    enum: ['pitch_deck', 'financials', 'legal', 'identity', 'other'],
    default: 'other'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending_review', 'signed', 'rejected'],
    default: 'pending_review'
  },
  eSignatureUrl: {
    type: String // Optional path to stored signature
  },
  isEncrypted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
