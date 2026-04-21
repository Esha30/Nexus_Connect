import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'live', 'completed'],
    default: 'pending'
  },
  roomID: {
    type: String,
    unique: true,
    sparse: true
  },
  meetingLink: {
    type: String
  }
}, {
  timestamps: true
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
