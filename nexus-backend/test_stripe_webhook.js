import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder_from_agent';
const API_URL = 'http://localhost:5001/api/stripe/webhook';

// Mock data
const payload = {
  id: 'evt_test_123',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_abc123',
      amount_total: 2900, // $29.00
      currency: 'usd',
      customer_email: 'entrepreneur@nexus.test',
      metadata: {
        userId: '67512826cfab875323945bd8', // Replace with a real User ID from your DB
        plan: 'pro'
      }
    }
  }
};

const payloadString = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000);
const signaturePayload = `${timestamp}.${payloadString}`;
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(signaturePayload)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('--- Testing Stripe Webhook ---');
console.log('Target URL:', API_URL);
console.log('Mock Session ID:', payload.data.object.id);

try {
  const response = await axios.post(API_URL, payloadString, {
    headers: {
      'stripe-signature': stripeSignature,
      'Content-Type': 'application/json'
    }
  });
  console.log('Response Status:', response.status);
  console.log('Response Data:', response.data);
} catch (error) {
  console.error('Webhook Test Failed:', error.response?.data || error.message);
}
