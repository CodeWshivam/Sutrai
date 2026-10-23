import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import healthRouter from './routes/health';
import analyzeRouter from './routes/analyze';
import incidentsRouter from './routes/incidents';
import weatherRouter from './routes/weather';
import directoryRouter from './routes/directory';
import routingRouter from './routes/routing';
import notificationsRouter from './routes/notifications';
import { apiRateLimiter, errorHandler } from './middleware/security';

export const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
app.use(cors({
  origin: [config.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all /api routes
app.use('/api', apiRateLimiter);

// Mount API routes
app.use('/api', healthRouter);
app.use('/api', analyzeRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api', weatherRouter);
app.use('/api', directoryRouter);
app.use('/api', routingRouter);
app.use('/api', notificationsRouter);

// Central error handler
app.use(errorHandler);

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`[SutrAI Backend] Running on http://localhost:${PORT}`);
    console.log(`[SutrAI Backend] Gemini AI Status: ${config.gemini.isConfigured ? 'CONNECTED' : 'DEMO MODE (Set GEMINI_API_KEY in .env for live API)'}`);
    console.log(`[SutrAI Backend] Supabase Status: ${config.supabase.isConfigured ? 'CONNECTED' : 'LOCAL IN-MEMORY STORE'}`);
  });
}
