/**
 * Express App
 */
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS - allow frontend
const corsOptions = {
  origin: [
    config.frontendUrl,
    'http://localhost:5173', // dev
    'http://localhost:3000', // dev backend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Simple cookie parser
app.use((req, res, next) => {
  const cookies = {};
  req.headers.cookie?.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    cookies[key] = value;
  });
  req.cookies = cookies;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export default app;
