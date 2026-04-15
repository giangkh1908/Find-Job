/**
 * Sitemap Cache Model - Store parsed sitemap URLs for fast matching
 */
import { getDB } from '../config/database/connection.js';

const COLLECTION = 'sitemap_cache';

export async function setupSitemapCacheModel() {
  const db = getDB();
  const collection = db.collection(COLLECTION);

  const indexes = [
    [{ url: 1 }, { unique: true }],
    [{ slug: 1 }],
    [{ keywords: 1 }],
    [{ fetchedAt: -1 }],
  ];

  for (const [indexKeys, options] of indexes) {
    try {
      await collection.createIndex(indexKeys, options || {});
    } catch (err) {
      // Index may already exist
    }
  }
}

export const sitemapCacheModel = {
  async upsertMany(entries) {
    if (!entries.length) return 0;

    const db = getDB();
    const collection = db.collection(COLLECTION);
    const fetchedAt = new Date();

    const bulkOps = entries.map(entry => ({
      updateOne: {
        filter: { url: entry.url },
        update: {
          $set: {
            url: entry.url,
            slug: entry.slug,
            keywords: entry.slug.split('-'),
            fetchedAt,
          },
        },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(bulkOps);
    return result.upsertedCount + result.modifiedCount;
  },

  async findByKeyword(keyword) {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    const keywordLower = keyword.toLowerCase();

    return collection.find({
      $or: [
        { slug: { $regex: keywordLower, $options: 'i' } },
        { keywords: { $regex: keywordLower, $options: 'i' } },
      ],
    }).toArray();
  },

  async findByKeywords(keywords, limit = 10) {
    const db = getDB();
    const collection = db.collection(COLLECTION);

    if (!keywords.length) return [];

    const orConditions = keywords.flatMap(kw => [
      { slug: { $regex: kw.toLowerCase(), $options: 'i' } },
      { keywords: { $regex: kw.toLowerCase(), $options: 'i' } },
    ]);

    const results = await collection.find({ $or: orConditions }).limit(limit * 3).toArray();

    // Score and deduplicate
    const scored = results.map(doc => {
      let score = 0;
      for (const kw of keywords) {
        const kwLower = kw.toLowerCase();
        if (doc.slug.toLowerCase().includes(kwLower)) score += 10;
        if (doc.keywords.some(k => k.toLowerCase().includes(kwLower))) score += 5;
      }
      return { ...doc, score };
    });

    // Remove duplicates (same slug)
    const seen = new Set();
    const unique = scored.filter(doc => {
      if (seen.has(doc.slug)) return false;
      seen.add(doc.slug);
      return true;
    });

    // Sort by score, return top results
    return unique
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(doc => ({ url: doc.url, slug: doc.slug }));
  },

  async getLatestFetch() {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    const latest = await collection.findOne({}, { sort: { fetchedAt: -1 } });
    return latest?.fetchedAt || null;
  },

  async getCount() {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    return collection.countDocuments();
  },

  async clear() {
    const db = getDB();
    await db.collection(COLLECTION).deleteMany({});
  },
};
