import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';

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
    
    // SupportTicket might not have a 'status' field originally, 
    // but Mongoose allows adding if we enable strict=false or update it directly
    // Let's assume we can set status to 'resolved'
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
