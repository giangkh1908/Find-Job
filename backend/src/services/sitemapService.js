/**
 * Sitemap Service - Fetch via browser, save to database only
 */
import { config } from '../config/index.js';
import { sitemapCacheModel } from '../models/sitemapCacheModel.js';

function extractSitemapUrls(sitemapXml) {
  const urlRegex = /<loc>(https:\/\/www\.topcv\.vn\/tim-viec-lam-([^<]+))<\/loc>/g;
  const urls = [];
  let match;

  while ((match = urlRegex.exec(sitemapXml)) !== null) {
    urls.push({
      url: match[1],
      slug: match[2],
    });
  }

  return urls;
}

async function fetchWithFlareSolverr(url) {
  if (!config.flareSolverrUrl) {
    return null;
  }

  try {
    const response = await fetch(`${config.flareSolverrUrl}/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'request.get',
        url: url,
        maxTimeout: 60000,
      }),
    });

    const data = await response.json();
    
    if (data.status === 'ok' && data.solution?.response) {
      return data.solution.response;
    }
    
    console.log(`[FlareSolverr] Sitemap fetch failed: ${data.message || 'Unknown error'}`);
    return null;
  } catch (err) {
    console.error(`[FlareSolverr] Sitemap error: ${err.message}`);
    return null;
  }
}

export async function refreshSitemap() {
  const sitemapUrl = 'https://www.topcv.vn/sitemap/keywords.xml';
  
  // Try FlareSolverr first
  console.log('[SitemapService] Trying FlareSolverr...');
  let xml = await fetchWithFlareSolverr(sitemapUrl);
  
  if (xml) {
    console.log('[SitemapService] Got sitemap via FlareSolverr');
  } else {
    // Fall back to direct Playwright
    console.log('[SitemapService] Falling back to direct Playwright...');
    
    let chromium;
    try {
      ({ chromium } = await import('playwright'));
    } catch (err) {
      console.error('[SitemapService] Playwright not installed');
      return { success: false, message: 'Playwright not installed' };
    }

    const browser = await chromium.launch({ 
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      console.log('[SitemapService] Fetching sitemap via browser...');
      await page.goto(sitemapUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      xml = await page.evaluate(() => document.body.innerText);
      await browser.close();
    } catch (err) {
      await browser.close();
      console.error(`[SitemapService] Error: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  if (!xml || xml.length < 100) {
    return { success: false, message: 'Empty response' };
  }

  console.log('[SitemapService] XML preview:', xml.substring(0, 200));

  const urls = extractSitemapUrls(xml);
  console.log(`[SitemapService] Found ${urls.length} URLs`);

  if (urls.length === 0) {
    return { success: false, message: 'No URLs extracted' };
  }

  const count = await sitemapCacheModel.upsertMany(urls);

  return {
    success: true,
    urlsCount: urls.length,
    cachedCount: count,
  };
}
