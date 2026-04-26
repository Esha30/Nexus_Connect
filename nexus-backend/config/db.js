import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log("Falling back to local in-memory MongoDB for testing purposes...");
    try {
      const dbPath = 'd:/Nexus/nexus-backend/.mongo-data';
      // Create data directory if it doesn't exist
      const fs = await import('fs');
      if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

      const mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '4.4.29',
          downloadDir: 'd:/Nexus/nexus-backend/.mongo-bin'
        },
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`In-Memory MongoDB Connection Error: ${fallbackError.message}`);
    }
  }
};

