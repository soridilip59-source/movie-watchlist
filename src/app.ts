import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swaggerSpec';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { getDb, DBWrapper } from './db';
import { seedDatabase } from './db/seed';
import { connectMongo, seedMongoDatabase } from './db/mongo';

export async function createApp() {
  const app = express();

  // Try MongoDB connection if configured or running
  const isMongoConnected = await connectMongo();
  if (isMongoConnected) {
    await seedMongoDatabase();
  }

  // Always initialize SQLite engine for fast local fallback / tests
  const sqlInstance = await getDb();
  DBWrapper.setDb(sqlInstance);

  const schemaPath = path.join(__dirname, 'db/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    DBWrapper.exec(schemaSql);
  }

  try {
    const familyCheck = DBWrapper.prepare('SELECT COUNT(*) as count FROM families').get();
    if (!familyCheck || familyCheck.count === 0) {
      await seedDatabase();
    }
  } catch (err) {
    await seedDatabase();
  }

  // CORS Configuration - Handle Preflight OPTIONS for POST requests
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(express.json());
  app.use(requestLogger);

  // Serve static public folder for Web UI
  const publicDir = path.join(__dirname, '../public');
  app.use(express.static(publicDir));

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API Routes
  app.use('/api/v1', apiRouter);

  // Health Check Endpoint (Includes DB Status)
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      database: isMongoConnected ? 'MongoDB' : 'SQLite',
      timestamp: new Date().toISOString()
    });
  });

  // Root fallback to index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
      return next();
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
