const mongoose = require('mongoose');

const connectDB = async () => {
  // Support both MONGO_URI and MONGODB_URI env variable names
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  // In production, crash immediately if no URI is provided
  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[MongoDB] FATAL: MONGO_URI environment variable is not set!');
      process.exit(1);
    }
    // Local dev fallback
    console.warn('[MongoDB] No MONGO_URI set, trying local MongoDB...');
  }

  const connectionUri = uri || 'mongodb://127.0.0.1:27017/family_watchlist';

  try {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
