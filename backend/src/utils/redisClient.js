/**
 * Redis Client
 */
import Redis from 'ioredis';
import { config } from '../config/index.js';

let redis = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis({
      host: config.redisHost,
      port: config.redisPort,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    redis.on('connect', () => {
      console.log(`Connected to Redis: ${config.redisHost}:${config.redisPort}`);
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
  }

  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('Redis disconnected');
  }
}
