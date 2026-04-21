import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';
import User from './models/User.js';

dotenv.config();

const pushToAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    console.log(`Found ${users.length} users`);

    if (users.length < 2) {
      console.error('Not enough users');
      process.exit(1);
    }

    const sender = users[0]; // Just use the first user as sender

    const promises = users.map(user => {
      const notification = new Notification({
        recipient: user._id,
        sender: sender._id,
        type: 'system',
        content: `Broadcast: Authentication system has been stabilized. Welcome back, ${user.name}!`,
        isRead: false
      });
      return notification.save();
    });

    await Promise.all(promises);
    console.log(`Notifications pushed successfully to ALL ${users.length} users.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

pushToAll();
