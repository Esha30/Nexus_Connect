import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  entrepreneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

export default Collaboration;
