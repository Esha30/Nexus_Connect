import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Deal from '../models/Deal.js';

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
      }
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
