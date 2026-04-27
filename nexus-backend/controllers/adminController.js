import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Deal from '../models/Deal.js';
import SystemSettings from '../models/SystemSettings.js';
import AuditLog from '../models/AuditLog.js';
import Report from '../models/Report.js';

// Helper to log admin actions
const logAction = async (adminId, action, targetType, targetId, details) => {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      details
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const entrepreneurCount = await User.countDocuments({ role: 'entrepreneur' });
    const investorCount = await User.countDocuments({ role: 'investor' });
    const postCount = await Post.countDocuments();
    const dealCount = await Deal.countDocuments();
    const pendingTicketCount = await SupportTicket.countDocuments({ status: { $ne: 'resolved' } });

    // Calculate historical data for the last 7 days
    const historicalData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      historicalData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        users: count
      });
    }

    res.json({
      users: {
        total: userCount,
        entrepreneurs: entrepreneurCount,
        investors: investorCount
      },
      content: {
        posts: postCount,
        deals: dealCount
      },
      support: {
        pendingTickets: pendingTicketCount
      },
      analytics: historicalData
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats', error: error.message });
  }
};

// @desc    Get all users (detailed)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// @desc    Get a single user's full details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get post count for this user
    const postCount = await Post.countDocuments({ author: req.params.id });

    res.json({ ...user.toObject(), postCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete an administrator' });
    }

    await User.findByIdAndDelete(req.params.id);
    // Optionally delete user's posts, deals, etc.
    await Post.deleteMany({ author: req.params.id });
    
    res.json({ message: 'User and associated content removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/admin/posts
// @access  Private (Admin only)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email role').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};

// @desc    Delete a post (moderation)
// @route   DELETE /api/admin/posts/:id
// @access  Private (Admin only)
export const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed by moderator' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
};

// @desc    Get all support tickets
// @route   GET /api/admin/tickets
// @access  Private (Admin only)
export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

// @desc    Resolve a support ticket
// @route   PUT /api/admin/tickets/:id
// @access  Private (Admin only)
export const resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.status = 'resolved';
    ticket.updatedAt = new Date();
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve ticket', error: error.message });
  }
};

// @desc    Get pending priority access requests
// @route   GET /api/admin/priority
// @access  Private (Admin only)
export const getPendingPriority = async (req, res) => {
  try {
    const users = await User.find({ 'profile.priorityAccess': 'pending', role: 'investor' })
      .select('name email role profile')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch priority requests', error: error.message });
  }
};

// @desc    Approve priority access
// @route   PUT /api/admin/priority/:id
// @access  Private (Admin only)
export const approvePriority = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.profile) {
      user.profile.priorityAccess = 'approved';
      await user.save();
    }
    
    res.json({ message: 'Priority access approved', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve priority access', error: error.message });
  }
};

// @desc    Update user status (suspend/unsuspend/verify)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
export const updateUserStatus = async (req, res) => {
  const { status, isVerified } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (status) user.status = status;
    if (typeof isVerified === 'boolean') user.profile.isVerified = isVerified;
    
    await user.save();

    await logAction(
      req.user._id,
      `Updated user status to ${status || user.status}, verified: ${isVerified ?? user.profile.isVerified}`,
      'User',
      user._id,
      `User: ${user.email}`
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system settings', error: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    Object.assign(settings, req.body);
    settings.updatedBy = req.user._id;
    await settings.save();

    await logAction(
      req.user._id,
      'Updated system settings',
      'SystemSettings',
      settings._id,
      JSON.stringify(req.body)
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update system settings', error: error.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
  }
};
// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email role')
      .populate('reportedId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

// @desc    Delete/Resolve a report
// @route   DELETE /api/admin/reports/:id
// @access  Private (Admin only)
export const deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report removed/resolved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
};
