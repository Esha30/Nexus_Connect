import { GoogleGenerativeAI } from '@google/generative-ai';
import SupportTicket from '../models/SupportTicket.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handleSupportChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `You are a helpful customer support agent for 'Nexus', a platform that connects entrepreneurs with investors. 
Please assist the user with their inquiry. Be polite, concise, and professional. 

User Inquiry: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with support AI.' });
  }
};// @desc    Create a formal support ticket
// @route   POST /api/support
// @access  Public
export const createSupportTicket = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      message
    });

    console.log(`[TICKET-CREATED] ID: ${ticket.ticketId} | From: ${email}`);

    res.status(201).json({
      success: true,
      ticketId: ticket.ticketId,
      message: 'Transmission successfully registered in Nexus ledger.'
    });
  } catch (error) {
    console.error('Ticket Creation Error:', error);
    res.status(500).json({ error: 'Failed to register support transmission' });
  }
};
