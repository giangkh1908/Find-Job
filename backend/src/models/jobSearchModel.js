/**
 * Job Search Model - Data Access Layer
 */
import { getDB } from '../config/database/connection.js';

const COLLECTION = 'job_searches';

export async function setupJobSearchModel() {
  const db = getDB();
  const collection = db.collection(COLLECTION);

  const indexes = [
    [{ searchId: 1 }, { unique: true }],
    [{ userId: 1, createdAt: -1 }],
    [{ status: 1, updatedAt: -1 }],
  ];

  for (const [indexKeys, options] of indexes) {
    try {
      await collection.createIndex(indexKeys, options || {});
    } catch (err) {
      // Index may already exist.
    }
  }
}

export const jobSearchModel = {
  async create({ searchId, userId, prompt, platforms }) {
    const db = getDB();
    const doc = {
      searchId,
      userId,
      prompt,
      platforms,
      status: 'queued',
      progress: 0,
      resultCount: 0,
      results: [],
      aiAnalysis: null,
      locationStats: [],
      summary: '',
      error: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTION).insertOne(doc);
    return doc;
  },

  async findBySearchId(searchId) {
    const db = getDB();
    return db.collection(COLLECTION).findOne({ searchId });
  },

  async findBySearchIdForUser(searchId, userId) {
    const db = getDB();
    return db.collection(COLLECTION).findOne({ searchId, userId });
  },

  async update(searchId, patch) {
    const db = getDB();
    await db.collection(COLLECTION).updateOne(
      { searchId },
      {
        $set: {
          ...patch,
          updatedAt: new Date(),
        },
      }
    );
  },

  async setResults(searchId, scrapeResult) {
    const db = getDB();
    const { jobs, aiAnalysis, locationStats, summary } = scrapeResult;
    await db.collection(COLLECTION).updateOne(
      { searchId },
      {
        $set: {
          results: jobs,
          resultCount: jobs.length,
          aiAnalysis,
          locationStats,
          summary,
          updatedAt: new Date(),
        },
      }
    );
  },
};
