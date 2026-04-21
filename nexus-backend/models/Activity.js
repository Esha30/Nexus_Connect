import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // The person who owns the dashboard where this activity appears
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // The person who performed the action
  },
  action: {
    type: String,
    enum: [
      'PROFILE_VIEW',
      'COLLABORATION_REQUEST',
      'COLLABORATION_ACCEPTED',
      'MESSAGE_SENT',
      'MEETING_SCHEDULED',
      'DOCUMENT_UPLOADED'
    ],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient aggregation of recent activity and chart data
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
