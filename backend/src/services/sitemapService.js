/**
 * Sitemap Service - Fetch via browser, save to database only
 */
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

export async function refreshSitemap() {
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
    await page.goto('https://www.topcv.vn/sitemap/keywords.xml', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Get body text (the XML content)
    const xml = await page.evaluate(() => document.body.innerText);

    await browser.close();

    if (!xml || xml.length < 100) {
      return { success: false, message: 'Empty response' };
    }

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
  } catch (err) {
    await browser.close();
    console.error(`[SitemapService] Error: ${err.message}`);
    return { success: false, message: err.message };
  }
}
