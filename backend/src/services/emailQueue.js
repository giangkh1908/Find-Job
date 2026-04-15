/**
 * Email Queue - Redis
 */
import { getRedis } from '../utils/redisClient.js';

const QUEUE_KEY = 'email:queue';

export const emailQueue = {
  // Add job to queue
  async add(type, data) {
    const redis = getRedis();
    const job = {
      id: Date.now().toString(),
      type,
      data,
      createdAt: Date.now(),
      attempts: 0,
    };

    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    console.log(`Email queued: ${type} to ${data.email}`);
    return job;
  },

  // Get next job
  async getNext() {
    const redis = getRedis();
    const job = await redis.rpop(QUEUE_KEY);
    return job ? JSON.parse(job) : null;
  },

  // Get queue length
  async getLength() {
    const redis = getRedis();
    return await redis.llen(QUEUE_KEY);
  },
};
