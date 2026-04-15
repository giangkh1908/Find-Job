/**
 * Job Service - Business Logic
 */
import { generateId } from '../utils/helpers.js';
import { config } from '../config/index.js';
import { jobSearchModel } from '../models/jobSearchModel.js';
import { jobQueue } from './jobQueue.js';

export class JobError extends Error {
  constructor(message, status = 400, code = null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const jobService = {
  async createSearch(userId, { prompt, platforms, maxResults, location }) {
    const searchId = generateId();
    const cleanedPlatforms = Array.from(new Set(platforms));

    await jobSearchModel.create({
      searchId,
      userId,
      prompt: prompt.trim(),
      platforms: cleanedPlatforms,
      maxResults: maxResults || 20,
      location: location || '',
    });

    await jobQueue.add({
      searchId,
      userId,
      payload: {
        prompt: prompt.trim(),
        platforms: cleanedPlatforms,
        maxResults: maxResults || 20,
        locationPreference: location || null,
      },
    });

    return {
      searchId,
      status: 'queued',
      pollIntervalMs: config.jobQueuePollMs,
      message: 'Search task queued',
    };
  },

  async getStatus(userId, searchId) {
    const search = await jobSearchModel.findBySearchIdForUser(searchId, userId);
    if (!search) {
      throw new JobError('Search task not found', 404, 'NOT_FOUND');
    }

    return {
      searchId: search.searchId,
      status: search.status,
      progress: search.progress,
      resultCount: search.resultCount,
      error: search.error,
      createdAt: search.createdAt,
      startedAt: search.startedAt,
      completedAt: search.completedAt,
    };
  },

  async getResults(userId, searchId) {
    const search = await jobSearchModel.findBySearchIdForUser(searchId, userId);
    if (!search) {
      throw new JobError('Search task not found', 404, 'NOT_FOUND');
    }

    return {
      searchId: search.searchId,
      status: search.status,
      resultCount: search.resultCount,
      jobs: search.results || [],
      aiAnalysis: search.aiAnalysis,
      locationStats: search.locationStats || [],
      summary: search.summary || '',
      error: search.error,
    };
  },
};
