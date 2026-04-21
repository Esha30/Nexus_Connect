import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  equity: {
    type: Number,
    required: true // Percentage
  },
  status: {
    type: String,
    enum: ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'],
    default: 'Due Diligence'
  },
  stage: {
    type: String,
    default: 'Seed'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
