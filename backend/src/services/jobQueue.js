/**
 * Job Search Queue - Redis
 */
import { getRedis } from '../utils/redisClient.js';

const QUEUE_KEY = 'jobs:search:queue';

export const jobQueue = {
  async add(jobPayload) {
    const redis = getRedis();
    const job = {
      ...jobPayload,
      attempts: 0,
      createdAt: Date.now(),
      lastError: null,
    };

    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    return job;
  },

  async getNext() {
    const redis = getRedis();
    const raw = await redis.rpop(QUEUE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async retry(job, errorMessage) {
    const redis = getRedis();
    const nextJob = {
      ...job,
      attempts: (job.attempts || 0) + 1,
      lastError: errorMessage,
      updatedAt: Date.now(),
    };

    await redis.lpush(QUEUE_KEY, JSON.stringify(nextJob));
    return nextJob;
  },

  async getLength() {
    const redis = getRedis();
    return redis.llen(QUEUE_KEY);
  },
};
