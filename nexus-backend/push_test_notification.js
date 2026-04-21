import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';
import User from './models/User.js';

dotenv.config();

const pushNotification = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find two users to use as sender and recipient
    const users = await User.find().limit(2);
    if (users.length < 2) {
      console.error('Not enough users in DB to create a notification');
      process.exit(1);
    }

    const recipient = users[0];
    const sender = users[1];

    const notification = new Notification({
      recipient: recipient._id,
      sender: sender._id,
      type: 'investment',
      content: `Test Notification: Great news! ${sender.name} has shown interest in your startup proposal. Check it out now!`,
      isRead: false
    });

    await notification.save();
    console.log(`Notification pushed successfully to ${recipient.name} (ID: ${recipient._id}) from ${sender.name}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error pushing notification:', error);
    process.exit(1);
  }
};

pushNotification();
