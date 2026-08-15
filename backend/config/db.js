const mongoose = require('mongoose');

// Global cache for serverless environments (Vercel / AWS Lambda)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri && process.env.NODE_ENV === 'production') {
    console.error('[MongoDB] FATAL: MONGO_URI / MONGODB_URI environment variable is not set!');
    throw new Error('Database connection string is required in production');
  }

  const connectionUri = uri || 'mongodb://127.0.0.1:27017/family_watchlist';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(connectionUri, opts)
      .then((mongooseInstance) => {
        console.log(`[MongoDB] Connected successfully to ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch(async (error) => {
        if (process.env.NODE_ENV === 'production') {
          cached.promise = null;
          if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
            console.error('[MongoDB] FATAL: Invalid MongoDB Atlas username or password in MONGO_URI/MONGODB_URI.');
            console.error('[MongoDB] TIP: If your MongoDB password contains special characters like @ # $ %, URL-encode them (e.g. @ -> %40).');
            error.message = 'MongoDB Atlas Authentication Failed: Please check username and password in Vercel Environment Variables (MONGO_URI / MONGODB_URI). If your password contains special characters (@, #, $), URL-encode them.';
          } else {
            console.error(`[MongoDB] Connection failed: ${error.message}`);
          }
          throw error;
        }

        console.warn(`[MongoDB] Local MongoDB is not running (${error.message}).`);
        console.log('[MongoDB] Starting in-memory MongoDB fallback server...');

        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        const memInstance = await mongoose.connect(memUri);
        console.log(`[MongoDB] Connected to in-memory database at ${memUri}`);

        if (process.env.NODE_ENV !== 'test') {
          const Movie = require('../models/Movie');
          const count = await Movie.countDocuments();
          if (count === 0) {
            console.log('[MongoDB] Auto-seeding initial catalog for zero-config startup...');
            try {
              const { seedData } = require('../seed');
              if (typeof seedData === 'function') {
                await seedData(false);
              }
            } catch (sErr) {
              console.warn('[MongoDB] Auto-seed note:', sErr.message);
            }
          }
        }
        return memInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
