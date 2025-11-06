import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import logger from './config/logger.js';
import { connectDB } from './db/mongo.js';
import { cacheService } from './services/cache.js';
import { meilisearchService } from './services/meilisearch.js';
import searchRouter from './routes/search.js';

const app = express();

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'YouTube Keyword Finder API',
    version: '1.0.0',
    endpoints: {
      search: '/api/search?q=<keyword>&limit=<number>',
      health: '/api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'connected',
      redis: cacheService.isConnected ? 'connected' : 'disconnected',
      meilisearch: 'connected'
    }
  });
});

app.use('/api/search', searchRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message
  });
});

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Connected to MongoDB');

    await cacheService.connect();
    logger.info('Connected to Redis');

    await meilisearchService.initialize();
    logger.info('Initialized Meilisearch');

    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════╗
║  YouTube Keyword Finder API                           ║
║  Server running on port ${PORT}                      ║
║  Environment: ${config.nodeEnv}                    ║
║  Endpoints:                                           ║
║    - GET /api/search?q=<keyword>                      ║
║    - GET /api/health                                  ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  await cacheService.disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
