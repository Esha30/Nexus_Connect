import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Meeting from './models/Meeting.js';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus';

async function seedGroupMeeting() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  try {
    const host = await User.findOne({ email: 'investor@nexus.test' });
    const p1 = await User.findOne({ email: 'entrepreneur@nexus.test' });
    
    if (!host || !p1) {
      console.error('Test users missing. Run seed_test_users.js first.');
      process.exit(1);
    }

    // Delete existing test meetings to clear the view
    await Meeting.deleteMany({ title: 'STRATEGIC BOARD REVIEW' });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endTime = new Date(tomorrow);
    endTime.setHours(endTime.getHours() + 1);

    const groupMeeting = new Meeting({
      host: host._id,
      participants: [p1._id],
      title: 'STRATEGIC BOARD REVIEW',
      description: 'Reviewing quarterly milestones and investment targets.',
      startTime: tomorrow,
      endTime: endTime,
      status: 'accepted',
      roomID: 'zoom-style-demo-room',
      meetingLink: '/meeting/zoom-style-demo-room'
    });

    await groupMeeting.save();
    console.log('✅ Group Meeting Seeded Successfully!');
    console.log('Meeting ID:', groupMeeting._id);
    console.log('Room ID:', groupMeeting.roomID);

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedGroupMeeting();
