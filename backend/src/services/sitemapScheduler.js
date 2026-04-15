/**
 * Sitemap Scheduler - Fetch & cache sitemap every 12 hours to database
 */
import { sitemapCacheModel } from '../models/sitemapCacheModel.js';
import { refreshSitemap } from './sitemapService.js';

const FETCH_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // Consider stale after 24h

let intervalRef = null;

export async function syncSitemap() {
  const latestFetch = await sitemapCacheModel.getLatestFetch();
  const count = await sitemapCacheModel.getCount();

  if (count > 0 && latestFetch) {
    const ageMs = Date.now() - latestFetch.getTime();
    if (ageMs < FETCH_INTERVAL_MS) {
      console.log(`[SitemapScheduler] Cache healthy: ${count} URLs (last: ${latestFetch.toISOString()})`);
      return { success: true, cachedCount: count, fromCache: true };
    }
  }

  console.log('[SitemapScheduler] Syncing sitemap to database...');
  return await refreshSitemap();
}

export function startSitemapScheduler() {
  console.log('[SitemapScheduler] Starting...');
  
  // Initial sync
  syncSitemap();

  // Schedule periodic syncs
  intervalRef = setInterval(syncSitemap, FETCH_INTERVAL_MS);
  
  console.log(`[SitemapScheduler] Running (interval: 12h)`);
}

export function stopSitemapScheduler() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    console.log('[SitemapScheduler] Stopped');
  }
}
