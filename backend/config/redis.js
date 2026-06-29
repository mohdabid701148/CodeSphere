import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

// Create an Upstash Redis client using REST
// Only create a real client if credentials are present
const redisClient = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export const connectRedis = async () => {
  if (redisClient) {
    console.log('Upstash Redis REST API Configured');
  } else {
    console.warn('Upstash Redis credentials missing - caching disabled.');
  }
};

export default redisClient;
