import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// @desc    Process a new payment/transaction (Realistic Simulation)
// @route   POST /api/payments
export const processPayment = async (req, res) => {
  const { amount, type, description } = req.body;
  const numAmount = Number(amount);

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Business Logic: Withdrawal/Investment checks
    if ((type === 'withdrawal' || type === 'investment' || type === 'subscription') && user.profile.walletBalance < numAmount) {
      return res.status(400).json({ message: 'Insufficient funds for this transaction' });
    }

    // Mock processing delay (Real-world feel)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      amount: numAmount,
      type,
      status: 'completed',
      reference: `NEX_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`
    });

    // Update User Balance
    if (type === 'deposit') {
      user.profile.walletBalance += numAmount;
    } else {
      user.profile.walletBalance -= numAmount;
    }

    await Promise.all([transaction.save(), user.save()]);

    res.status(201).json({
      transaction,
      newBalance: user.profile.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

// @desc    Upgrade or change User Subscription Plan
// @route   POST /api/payments/subscribe
export const updateSubscription = async (req, res) => {
  const { plan } = req.body; // 'starter', 'pro', 'enterprise'
  const planCosts = { starter: 0, pro: 29, enterprise: 500 };

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cost = planCosts[plan] || 0;

    // If it's a paid plan, check balance first (Simulating prepaid model)
    if (cost > 0 && user.profile.walletBalance < cost) {
      return res.status(400).json({ 
        message: `Insufficient balance. You need $${cost} to upgrade to ${plan.toUpperCase()}` 
      });
    }

    // Subtract cost and update plan
    if (cost > 0) {
      user.profile.walletBalance -= cost;
      
      // Log the subscription purchase
      const tx = new Transaction({
        user: user._id,
        amount: cost,
        type: 'subscription',
        status: 'completed',
        reference: `SUB_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        description: `Upgrade to ${plan.toUpperCase()} Plan`
      });
      await tx.save();
    }

    user.profile.subscription.plan = plan;
    user.profile.subscription.status = 'active';
    user.profile.subscription.updatedAt = new Date();

    await user.save();

    res.json({
      message: `Successfully upgraded to ${plan.toUpperCase()}`,
      plan: user.profile.subscription.plan,
      newBalance: user.profile.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Subscription update failed', error: error.message });
  }
};

// @desc    Get user's transactions
// @route   GET /api/payments/history
export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction history', error: error.message });
  }
};
