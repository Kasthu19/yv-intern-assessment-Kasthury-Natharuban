const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/member_management';

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[Database] Connected to local MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Local MongoDB service not available at ${mongoUri} (${error.message}).`);
    console.log('[Database] Launching in-memory MongoDB fallback server...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[Database] Connected to In-Memory MongoDB Fallback: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error('[Database Error] Failed to start MongoDB fallback:', fallbackError.message);
      console.error('Please start MongoDB service locally or set MONGODB_URI in your .env file.');
    }
  }
};

module.exports = connectDB;
