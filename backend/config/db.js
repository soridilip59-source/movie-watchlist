const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/family_watchlist';
  try {
    // Attempt standard connection with 3-second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Connection to local MongoDB (${uri}) failed: ${error.message}`);
    console.log('[MongoDB] Starting in-memory MongoDB fallback server...');
    try {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          spawnTimeoutMS: 60000,
        },
      });
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[MongoDB] Connected to fallback MongoMemoryServer at ${mongoUri}`);
    } catch (fallbackError) {
      console.error(`[MongoDB] Fallback connection failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
