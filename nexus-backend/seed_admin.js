import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

await connectDB();

const accounts = [
  {
    name: 'Master Admin',
    email: 'admin@nexus.test',
    password: 'Admin1234!',
  },
  {
    name: 'Esha Mughal',
    email: 'instaguard7@gmail.com',
    password: 'eshamughal@123',
  },
];

for (const acc of accounts) {
  const passwordHash = await bcrypt.hash(acc.password, 10);
  const result = await User.findOneAndUpdate(
    { email: acc.email },
    {
      $set: {
        name: acc.name,
        email: acc.email,
        password: passwordHash,
        role: 'admin',
        authProvider: 'local',
        'profile.isVerified': true,
        'profile.bio': 'Nexus Platform Administrator.',
      }
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  console.log(`✅ Admin seeded: ${result.email} | id: ${result._id}`);
}

console.log('\n🔑 ADMIN CREDENTIALS:');
console.log('  admin@nexus.test       / Admin1234!');
console.log('  instaguard7@gmail.com  / eshamughal@123');

process.exit(0);
