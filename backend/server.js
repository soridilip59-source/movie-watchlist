const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy on Vercel / reverse proxies
app.set('trust proxy', 1);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  /\.vercel\.app$/,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((o) =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    if (allowed) return callback(null, true);
    callback(null, true); // Fallback allow in serverless multi-domain environments
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serverless DB Connection Middleware (Guarantees DB is connected for every request)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Rate limiting on auth endpoints (skipped in test mode)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Root Welcome & Health Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🍿 Family Movie Watchlist API is running smoothly in production',
    endpoints: {
      health: '/api/health',
      auth_register: '/api/auth/register',
      auth_login: '/api/auth/login',
      movies: '/api/movies',
      watchlist: '/api/watchlist'
    }
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Family Movie Watchlist API is running smoothly in production',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/families', require('./routes/familyRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/movies/:movieId/reviews', require('./routes/reviewRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Standalone server initialization (skipped when deployed as Vercel Serverless Function or imported in tests)
if (require.main === module && !process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Express server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }).catch((err) => {
    console.error('[Server] Failed to initialize server:', err.message);
  });
}

module.exports = app;

