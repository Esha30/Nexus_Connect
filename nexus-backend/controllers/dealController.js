import Deal from '../models/Deal.js';
import User from '../models/User.js';

// @desc    Get deals for current user
// @route   GET /api/deals
export const getDeals = async (req, res) => {
  try {
    const isInvestor = req.user.role === 'investor';
    const filter = isInvestor ? { investor: req.user._id } : { startup: req.user._id };

    const deals = await Deal.find(filter)
      .populate('investor', 'name profile.avatarUrl')
      .populate('startup', 'name profile.startupName profile.industry profile.avatarUrl')
      .sort({ updatedAt: -1 });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deals', error: error.message });
  }
};

// @desc    Create a new deal
// @route   POST /api/deals
export const createDeal = async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can create deals' });
    }

    const { startupId, amount, equity, status, stage } = req.body;
    
    // Convert M/K suffixes to numbers if passed as string (e.g., "1.5M")
    // For simplicity, we just parse the numeric equivalent.
    
    const newDeal = await Deal.create({
      investor: req.user._id,
      startup: startupId,
      amount,
      equity,
      status: status || 'Due Diligence',
      stage: stage || 'Seed',
      lastActivity: Date.now()
    });

    const populatedDeal = await Deal.findById(newDeal._id)
      .populate('investor', 'name profile.avatarUrl')
      .populate('startup', 'name profile.startupName profile.industry profile.avatarUrl');

    res.status(201).json(populatedDeal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating deal', error: error.message });
  }
};

// @desc    Update a deal
// @route   PUT /api/deals/:id
export const updateDeal = async (req, res) => {
  try {
    const { status, equity, amount } = req.body;
    
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, investor: req.user._id },
      { status, equity, amount, lastActivity: Date.now() },
      { new: true }
    )
    .populate('investor', 'name profile.avatarUrl')
    .populate('startup', 'name profile.startupName profile.industry profile.avatarUrl');
    
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating deal', error: error.message });
  }
};
