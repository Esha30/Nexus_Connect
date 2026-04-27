import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get all conversations for the logged in user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate({
        path: 'participants',
        select: 'name profile.avatarUrl profile.isOnline profile.lastActive'
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    // Format for frontend
    const formattedConversations = conversations.map(conv => {
      // Find the other participant
      const partner = conv.participants.find(p => p._id.toString() !== req.user._id.toString());
      
      return {
        id: conv._id.toString(),
        participants: conv.participants.map(p => p._id.toString()),
        partner: partner ? {
          id: partner._id.toString(),
          name: partner.name,
          avatarUrl: partner.profile?.avatarUrl || null,
          isOnline: partner.profile?.isOnline || false,
          lastActive: partner.profile?.lastActive,
        } : null,
        lastMessage: conv.lastMessage ? {
          id: conv.lastMessage._id.toString(),
          senderId: conv.lastMessage.senderId.toString(),
          receiverId: conv.lastMessage.receiverId.toString(),
          content: conv.lastMessage.content,
          timestamp: conv.lastMessage.createdAt,
          isRead: conv.lastMessage.isRead,
          isDeleted: conv.lastMessage.isDeleted,
          fileUrl: conv.lastMessage.fileUrl,
          fileName: conv.lastMessage.fileName,
          fileType: conv.lastMessage.fileType,
          deletedFor: conv.lastMessage.deletedFor || []
        } : null,
        unreadCount: conv.unreadCounts ? conv.unreadCounts[req.user._id.toString()] || 0 : 0,
        isMuted: conv.mutedBy?.some(id => id.toString() === req.user._id.toString()) || false,
        isArchived: conv.archivedBy?.some(id => id.toString() === req.user._id.toString()) || false,
        updatedAt: conv.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/messages/read/:partnerId
// @access  Private
export const markAllRead = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, partnerId] }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId: conversation._id, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Reset unread count for this user
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    // Mark any unread message-type notifications from this sender as read
    await Notification.updateMany(
      { recipient: userId, sender: partnerId, type: 'message', isRead: false },
      { $set: { isRead: true } }
    );

    const io = req.app.get('socketio');
    if (io) {
      io.to(userId.toString()).emit('message-count-update');
      io.to(userId.toString()).emit('notification-count-update');
    }

    res.json({ message: 'Marked all as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Server error marking messages as read' });
  }
};

// @desc    Get messages between logged in user and another user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    });

    if (!conversation) {
      return res.json([]);
    }

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId: conversation._id, receiverId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    // Reset unread count for this user
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(req.user._id.toString(), 0);
      await conversation.save();
    }

    // Emit event to update unread message counts in real-time for the reader
    const io = req.app.get('socketio');
    if (io) {
      io.to(req.user._id.toString()).emit('message-count-update');
    }

    // Mark any unread message-type notifications from this sender as read
    // This clears the notification badge on the bell icon
    await Notification.updateMany(
      { recipient: req.user._id, sender: userId, type: 'message', isRead: false },
      { $set: { isRead: true } }
    );
    // Emit notification count update so the bell badge clears in real-time
    if (io) {
      io.to(req.user._id.toString()).emit('notification-count-update');
    }

    const messages = await Message.find({ 
      conversationId: conversation._id,
      deletedFor: { $ne: req.user._id }
    })
      .populate('replyTo', 'senderId content')
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),
      content: msg.content,
      timestamp: msg.createdAt,
      isRead: msg.isRead,
      isDeleted: msg.isDeleted,
      isEdited: msg.isEdited,
      replyTo: msg.replyTo ? {
        id: msg.replyTo._id.toString(),
        senderId: msg.replyTo.senderId.toString(),
        content: msg.replyTo.content
      } : undefined,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileType: msg.fileType
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
// Normally handled by sockets, but good to have a REST fallback
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    // Validate receiverId is present and a valid ObjectId
    if (!receiverId || receiverId === 'undefined') {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiverId format' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        unreadCounts: {
          [senderId.toString()]: 0,
          [receiverId.toString()]: 0
        }
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      content: content || '',
      replyTo: req.body.replyTo || undefined,
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName,
      fileType: req.body.fileType
    });

    if (newMessage.replyTo) {
      await newMessage.populate('replyTo', 'senderId content');
    }

    // Check receiver's notification preferences
    const receiver = await User.findById(receiverId).select('profile.pushNotifications').lean();
    const isMuted = conversation.mutedBy?.some(id => id.toString() === receiverId.toString());
    const shouldNotify = receiver?.profile?.pushNotifications !== false && !isMuted;

    if (shouldNotify) {
      // Create Notification
      const notification = await Notification.create({
        recipient: receiverId,
        sender: senderId,
        type: 'message',
        content: 'sent you a message',
        relatedEntity: newMessage._id
      });
      await notification.populate('sender', 'name profile.avatarUrl');

      const io = req.app.get('socketio');
      if (io) {
        io.to(receiverId.toString()).emit('new-notification', notification);
      }
    }

    // Update conversation last message and increment unread count for receiver
    const currentUnread = conversation.unreadCounts ? conversation.unreadCounts.get(receiverId.toString()) || 0 : 0;
    
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(receiverId.toString(), currentUnread + 1);
    } else {
      conversation.unreadCounts = new Map([
        [senderId.toString(), 0],
        [receiverId.toString(), 1]
      ]);
    }
    
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    res.status(201).json({
      id: newMessage._id,
      senderId: newMessage.senderId.toString(),
      receiverId: newMessage.receiverId.toString(),
      content: newMessage.content,
      timestamp: newMessage.createdAt,
      isRead: newMessage.isRead,
      isDeleted: newMessage.isDeleted,
      isEdited: newMessage.isEdited,
      replyTo: newMessage.replyTo ? {
        id: newMessage.replyTo._id.toString(),
        senderId: newMessage.replyTo.senderId.toString(),
        content: newMessage.replyTo.content
      } : undefined,
      fileUrl: newMessage.fileUrl,
      fileName: newMessage.fileName,
      fileType: newMessage.fileType
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteType } = req.body; // 'me' or 'everyone'
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (deleteType === 'everyone') {
      if (message.senderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete for everyone' });
      }
      // Soft delete for everyone
      message.isDeleted = true;
      message.content = 'This message was deleted';
      message.fileUrl = undefined;
      message.fileName = undefined;
      message.fileType = undefined;
    } else {
      // Delete for me
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
      }
    }
    
    await message.save();

    res.json({ message: 'Message deleted', id, deleteType });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const message = await Message.findById(id).populate('replyTo', 'senderId content');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit' });
    }

    if (message.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit a deleted message' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.json({
      id: message._id,
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      content: message.content,
      timestamp: message.createdAt,
      isRead: message.isRead,
      isDeleted: message.isDeleted,
      isEdited: message.isEdited,
      replyTo: message.replyTo ? {
        id: message.replyTo._id.toString(),
        senderId: message.replyTo.senderId.toString(),
        content: message.replyTo.content
      } : undefined,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileType: message.fileType
    });
  } catch (err) {
    console.error('Error editing message:', err);
    res.status(500).json({ message: 'Server error editing message' });
  }
};

// @desc    Clear entire chat
// @route   DELETE /api/messages/clear/:partnerId
// @access  Private
export const clearChat = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user._id;

    await mongoose.model('Message').deleteMany({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    });

    await Conversation.findOneAndDelete({
      participants: { $all: [userId, partnerId] }
    });

    res.json({ message: 'Chat cleared successfully' });
  } catch (err) {
    console.error('Error clearing chat:', err);
    res.status(500).json({ message: 'Server error clearing chat' });
  }
};

// @desc    Toggle Mute Chat
// @route   PUT /api/messages/mute/:partnerId
// @access  Private
export const toggleMuteChat = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, partnerId] }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isMuted = conversation.mutedBy?.some(id => id.toString() === userId.toString());
    
    if (isMuted) {
      conversation.mutedBy = conversation.mutedBy.filter(id => id.toString() !== userId.toString());
    } else {
      conversation.mutedBy = conversation.mutedBy || [];
      conversation.mutedBy.push(userId);
    }

    await conversation.save();
    res.json({ message: isMuted ? 'Chat unmuted' : 'Chat muted', isMuted: !isMuted });
  } catch (err) {
    console.error('Error toggling mute:', err);
    res.status(500).json({ message: 'Server error toggling mute' });
  }
};

// @desc    Toggle Archive Chat
// @route   PUT /api/messages/archive/:partnerId
// @access  Private
export const toggleArchiveChat = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, partnerId] }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isArchived = conversation.archivedBy?.some(id => id.toString() === userId.toString());
    
    if (isArchived) {
      conversation.archivedBy = conversation.archivedBy.filter(id => id.toString() !== userId.toString());
    } else {
      conversation.archivedBy = conversation.archivedBy || [];
      conversation.archivedBy.push(userId);
    }

    await conversation.save();
    res.json({ message: isArchived ? 'Chat unarchived' : 'Chat archived', isArchived: !isArchived });
  } catch (err) {
    console.error('Error toggling archive:', err);
    res.status(500).json({ message: 'Server error toggling archive' });
  }
};
