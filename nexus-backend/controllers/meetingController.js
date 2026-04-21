import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import crypto from 'crypto';

// @desc    Create new meeting request (Group Support)
// @route   POST /api/meetings
// @access  Private
export const createMeeting = async (req, res) => {
  const { participants: participantIds, title, description, startTime, endTime } = req.body;

  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ message: 'At least one participant is required.' });
  }

  if (new Date(endTime) <= new Date(startTime)) {
    return res.status(400).json({ message: 'End time must be after start time.' });
  }

  try {
    // Check for overlaps for ALL participants + Host
    const allMemberIds = [...new Set([...participantIds, req.user._id.toString()])];
    
    const overlappingMeeting = await Meeting.findOne({
      status: 'accepted',
      $and: [
        {
          $or: [
            { host: { $in: allMemberIds } },
            { participants: { $in: allMemberIds } }
          ]
        },
        {
          $or: [
            { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
            { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
            { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } }
          ]
        }
      ]
    });

    if (overlappingMeeting) {
      return res.status(400).json({ 
        message: 'One or more participants (or you) have an overlapping meeting scheduled.'
      });
    }

    const meeting = new Meeting({
      host: req.user._id,
      participants: participantIds,
      title,
      description,
      startTime,
      endTime,
      roomID: crypto.randomBytes(6).toString('hex') // Unique Zoom-like room code
    });

    const createdMeeting = await meeting.save();
    
    // Fetch participants with their notification preferences
    const receivers = await User.find({ _id: { $in: participantIds } }).select('profile.pushNotifications').lean();
    
    // Notifications and Activity for eligible participants
    const notifications = receivers
      .filter(u => u.profile?.pushNotifications !== false)
      .map(u => ({
        recipient: u._id,
        sender: req.user._id,
        type: 'meeting',
        content: `invited you to a group session: ${title}`,
        relatedEntity: createdMeeting._id
      }));

    if (notifications.length > 0) {
      const createdNotifications = await Notification.insertMany(notifications);
      
      // Emit socket events
      const io = req.app.get('socketio');
      if (io) {
        createdNotifications.forEach((notif) => {
          io.to(notif.recipient.toString()).emit('new-meeting', {
            meetingId: createdMeeting._id,
            title: createdMeeting.title,
            senderName: req.user.name
          });
          io.to(notif.recipient.toString()).emit('new-notification', notif);
        });
      }
    }

    res.status(201).json(createdMeeting);
  } catch (error) {
    console.error("Meeting Creation Error:", error);
    res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
  }
};

// @desc    Get user's meetings (Participating or Hosting)
// @route   GET /api/meetings
// @access  Private
export const getUserMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { participants: req.user._id }]
    })
    .populate('host', 'name email role profile.avatarUrl')
    .populate('participants', 'name email role profile.avatarUrl')
    .lean();

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
};

// @desc    Update meeting status
// @route   PUT /api/meetings/:id/status
// @access  Private
export const updateMeetingStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only host or participants can interact
    const isHost = meeting.host.toString() === req.user._id.toString();
    const isParticipant = meeting.participants.some(p => p.toString() === req.user._id.toString());

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }

    meeting.status = status;
    
    if (status === 'accepted') {
      meeting.meetingLink = `/meeting/${meeting.roomID}`;
    }

    const updatedMeeting = await meeting.save();

    // Notify other members of change
    const targetIds = [meeting.host.toString(), ...meeting.participants.map(p => p.toString())]
      .filter(id => id !== req.user._id.toString());

    const io = req.app.get('socketio');
    if (io) {
      targetIds.forEach(targetId => {
        io.to(targetId).emit('meeting-updated', {
          meetingId: updatedMeeting._id,
          status: updatedMeeting.status,
          title: updatedMeeting.title,
          updatedBy: req.user.name
        });
      });
    }

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meeting', error: error.message });
  }
};
