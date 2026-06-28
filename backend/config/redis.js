import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

// Create an Upstash Redis client using REST
// It uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from .env automatically
// We provide fallbacks so it doesn't crash if they are missing
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://dummy.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
});

export const connectRedis = async () => {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    console.log('Upstash Redis REST API Configured');
  } else {
    console.warn('Upstash Redis credentials missing - caching disabled.');
  }
};

export default redisClient;
