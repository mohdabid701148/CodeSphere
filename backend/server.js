import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import authRouter from './routes/auth.js';
import integrationsRouter from './routes/integrations.js';
import syncRouter from './routes/sync.js';
import profileRouter from './routes/profile.js';

// Environment variable validation
const requiredEnvVars = ['MONGODB_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRouter);
app.use('/integrations', integrationsRouter);
app.use('/sync', syncRouter);
app.use('/profile', profileRouter);

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
