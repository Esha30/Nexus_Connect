import Stripe from 'stripe';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Checkout Session for Subscription
// @route   POST /api/stripe/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  const { plan } = req.body;
  const user = req.user;

  const planDetails = {
    pro: {
      name: 'Nexus Pro Plan',
      amount: 10000, // $100.00
      currency: 'usd',
    },
    enterprise: {
      name: 'Nexus Enterprise Plan',
      amount: 50000, // $500.00
      currency: 'usd',
    }
  };

  if (!planDetails[plan]) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  try {
    // --- NEXUS DEMO MODE FORCED ---
    if (true) { // Always use demo mode for now as requested
      console.warn('⚠️ [NEXUS DEMO MODE] Stripe is in dummy mode. Simulating checkout success.');
      
      // Auto-upgrade user for demo purposes
      const demoUser = await User.findById(req.user._id);
      if (demoUser) {
        demoUser.profile.subscription = {
          plan: plan,
          status: 'active',
          updatedAt: new Date()
        };
        await demoUser.save();
      }

      return res.json({ 
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing/success?demo=true`,
        message: 'Demo mode active. Subscription simulated.' 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: planDetails[plan].currency,
            product_data: {
              name: planDetails[plan].name,
            },
            unit_amount: planDetails[plan].amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Or 'subscription' if using Stripe products/prices
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        plan: plan,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};

// @desc    Verify Stripe Session status and update user plan (Success Page Sync)
// @route   GET /api/stripe/verify-session/:sessionId
// @access  Private
export const verifySession = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const plan = session.metadata.plan;
      
      const user = await User.findById(userId);
      if (user && user.profile.subscription.plan !== plan) {
        user.profile.subscription.plan = plan;
        user.profile.subscription.status = 'active';
        user.profile.subscription.updatedAt = new Date();
        await user.save();

        // Ensure transaction record exists
        const existingTx = await Transaction.findOne({ reference: sessionId });
        if (!existingTx) {
          await Transaction.create({
            user: userId,
            amount: session.amount_total / 100,
            type: 'subscription',
            status: 'completed',
            reference: sessionId,
            description: `Stripe Verified Payment for ${plan.toUpperCase()} Plan`
          });
        }
        
        console.log(`✅ Manual Sync: Subscription updated for user: ${userId} to ${plan}`);
        return res.json({ success: true, plan, user: user });
      }
      
      return res.json({ success: true, plan: user.profile.subscription.plan, user: user });
    }

    res.status(400).json({ success: false, message: 'Payment not completed' });
  } catch (error) {
    console.error('Verify Session Error:', error);
    res.status(500).json({ message: 'Error verifying session', error: error.message });
  }
};

// @desc    Handle Stripe Webhooks
// @route   POST /api/stripe/webhook
// @access  Public
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Stripe requires the raw body for signature verification
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, plan } = session.metadata;

    try {
      // 1. Update User Subscription
      const user = await User.findById(userId);
      if (user) {
        user.profile.subscription.plan = plan;
        user.profile.subscription.status = 'active';
        user.profile.subscription.updatedAt = new Date();
        await user.save();

        // 2. Create Transaction Record
        await Transaction.create({
          user: userId,
          amount: session.amount_total / 100,
          type: 'subscription',
          status: 'completed',
          reference: session.id,
          description: `Stripe Payment for ${plan.toUpperCase()} Plan`
        });

        console.log(`✅ Subscription updated for user: ${userId} to ${plan}`);
      }
    } catch (err) {
      console.error('Error updating user subscription from webhook:', err);
    }
  }

  res.json({ received: true });
};
