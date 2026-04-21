import Collaboration from '../models/Collaboration.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';

// @desc    Create a collaboration request
// @route   POST /api/collaborations
// @access  Private (Investor only)
export const createCollaboration = async (req, res) => {
  try {
    const { entrepreneurId, message } = req.body;
    const investorId = req.user._id;

    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can request collaborations' });
    }

    const existingRequest = await Collaboration.findOne({
      investor: investorId,
      entrepreneur: entrepreneurId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Collaboration request already pending' });
    }

    const collaboration = await Collaboration.create({
      investor: investorId,
      entrepreneur: entrepreneurId,
      message,
    });

    // Log activity
    await Activity.create({
      user: entrepreneurId, // The entrepreneur gets the notification
      actor: investorId,     // The investor is the performer
      action: 'COLLABORATION_REQUEST',
      metadata: {
        investorName: req.user.name,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      }
    });

    // Check entrepreneur's notification preferences
    const receiver = await User.findById(entrepreneurId).select('profile.pushNotifications').lean();
    const shouldNotify = receiver?.profile?.pushNotifications !== false;

    if (shouldNotify) {
      // Create Notification realtime
      const notification = await Notification.create({
        recipient: entrepreneurId,
        sender: investorId,
        type: 'connection',
        content: 'sent you a collaboration request',
        relatedEntity: collaboration._id
      });
      await notification.populate('sender', 'name profile.avatarUrl');

      // Emit socket event
      const io = req.app.get('socketio');
      if (io) {
        io.to(entrepreneurId.toString()).emit('new-collab', {
          requestId: collaboration._id,
          investorName: req.user.name,
          message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        });
        io.to(entrepreneurId.toString()).emit('new-notification', notification);
      }
    }

    res.status(201).json(collaboration);
  } catch (error) {
    res.status(500).json({ message: 'Error creating collaboration request', error: error.message });
  }
};

// @desc    Get collaboration requests for the logged in user
// @route   GET /api/collaborations
// @access  Private
export const getMyCollaborations = async (req, res) => {
  try {
    const userId = req.user._id;
    const query = req.user.role === 'investor' 
      ? { investor: userId } 
      : { entrepreneur: userId };

    const collaborations = await Collaboration.find(query)
      .populate('investor', 'name email profile')
      .populate('entrepreneur', 'name email profile')
      .sort({ createdAt: -1 })
      .lean();

    // Normalize so frontend can use both .id and ._id
    const normalized = collaborations.map(c => {
      const obj = { ...c };
      obj.id = obj._id.toString();
      if (obj.investor) obj.investor.id = obj.investor._id.toString();
      if (obj.entrepreneur) obj.entrepreneur.id = obj.entrepreneur._id.toString();
      return obj;
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collaborations', error: error.message });
  }
};

// @desc    Update collaboration request status
// @route   PUT /api/collaborations/:id/status
// @access  Private (Entrepreneur only)
export const updateCollaborationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected.' });
    }

    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    // Only the entrepreneur can accept/reject
    if (collaboration.entrepreneur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this collaboration request' });
    }

    collaboration.status = status;
    const updated = await collaboration.save();

    // Log activity if accepted
    if (status === 'accepted') {
      Activity.create({
        user: collaboration.investor, // The investor gets notified of acceptance
        actor: req.user._id,          // The entrepreneur is the performer
        action: 'COLLABORATION_ACCEPTED',
        metadata: {
          entrepreneurName: req.user.name,
          requestId: updated._id
        }
      }).catch(err => console.error('Activity logging failed:', err));
    }

    // Check investor's notification preferences
    const receiver = await User.findById(collaboration.investor).select('profile.pushNotifications').lean();
    const shouldNotify = receiver?.profile?.pushNotifications !== false;

    if (shouldNotify) {
      // Create Notification
      const notification = await Notification.create({
        recipient: collaboration.investor,
        sender: req.user._id,
        type: 'connection',
        content: `${status === 'accepted' ? 'accepted' : 'declined'} your collaboration request`,
        relatedEntity: updated._id
      });
      await notification.populate('sender', 'name profile.avatarUrl');

      // Emit socket event to investor
      const io = req.app.get('socketio');
      if (io) {
        io.to(collaboration.investor.toString()).emit('collab-updated', {
          requestId: updated._id,
          status: status,
          entrepreneurName: req.user.name
        });
        io.to(collaboration.investor.toString()).emit('new-notification', notification);
      }
    }

    res.json({ message: `Collaboration request ${status}`, collaboration: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating collaboration status', error: error.message });
  }
};
