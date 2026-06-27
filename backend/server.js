import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import connectDB from './config/db.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import authRouter from './routes/auth.js';
import integrationsRouter from './routes/integrations.js';
import syncRouter from './routes/sync.js';
import profileRouter from './routes/profile.js';
import contestsRouter from './routes/contestsRoutes.js';

// Environment variable validation
const requiredEnvVars = ['MONGODB_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`FATAL CONFIG ERROR: Missing environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // Compress response bodies

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/profile', globalLimiter);
app.use('/integrations', globalLimiter);

// Stricter Rate Limiting for Auth and Sync
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests to strict endpoints from this IP, please try again later.',
});

// Routes
app.use('/auth', strictLimiter, authRouter);
app.use('/integrations', integrationsRouter);
app.use('/sync', strictLimiter, syncRouter);
app.use('/profile', profileRouter);
app.use('/contests', contestsRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStateMap[dbStatus] || 'unknown',
      code: dbStatus
    },
    env: process.env.NODE_ENV || 'development'
  });
});

// Custom 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
