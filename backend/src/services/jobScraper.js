/**
 * Job Scraper - AI-powered scraping with sitemap matching
 */
import { config } from '../config/index.js';
import { getDB } from '../config/database/connection.js';
import { analyzePrompt, selectRelevantUrls, filterAndRankJobs } from './promptAnalyzer.js';
import { matchLocation, groupJobsByLocation } from '../utils/locationMatcher.js';
import { sitemapCacheModel } from '../models/sitemapCacheModel.js';
import { syncSitemap } from './sitemapScheduler.js';

let inMemoryCache = null;
let inMemoryCacheTime = 0;
const IN_MEMORY_TTL = 60 * 1000; // 1 minute

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
        cookies: [],
        proxy: {},
      }),
    });

    const data = await response.json();
    
    if (data.status === 'ok' && data.solution?.response) {
      return data.solution.response;
    }
    
    console.log(`[FlareSolverr] Failed for ${url}: ${data.message || 'Unknown error'}`);
    return null;
  } catch (err) {
    console.error(`[FlareSolverr] Error: ${err.message}`);
    return null;
  }
}

function extractJobsFromHtml(html) {
  const results = [];
  const parser = new (require('node-html-parser')).default(html);
  
  const cards = parser.querySelectorAll('.job-item-search-result');
  
  cards.forEach(card => {
    const titleEl = card.querySelector('a[aria-label]');
    const imgEl = card.querySelector('.avatar img');
    const salaryEl = card.querySelector('label.salary span');
    const addressEl = card.querySelector('label.address span');
    const expEl = card.querySelector('label.exp span');
    
    const title = titleEl?.getAttribute('aria-label') || '';
    const link = titleEl?.getAttribute('href')?.split('?')[0] || '';
    const company = imgEl?.getAttribute('alt') || '';
    const salary = salaryEl?.text?.trim() || 'Thoả thuận';
    const location = addressEl?.text?.trim() || 'N/A';
    const experience = expEl?.text?.trim() || 'N/A';
    
    if (title && link && !link.includes('cloudflare') && !link.includes('5xx')) {
      results.push({
        title,
        company: company || 'TopCV',
        salary,
        location,
        experience,
        link: link.startsWith('http') ? link : `https://www.topcv.vn${link}`,
      });
    }
  });
  
  return results;
}

async function getCachedUrls() {
  // Check in-memory cache first
  if (inMemoryCache && Date.now() - inMemoryCacheTime < IN_MEMORY_TTL) {
    return inMemoryCache;
  }

  // Query from database
  const count = await sitemapCacheModel.getCount();
  
  if (count === 0) {
    console.log('Sitemap cache is empty, triggering sync...');
    const result = await syncSitemap();
    if (!result?.success) {
      console.warn('Sitemap sync failed, returning empty array');
      return [];
    }
  }

  // Get all URLs from cache
  const db = getDB();
  const urls = await db.collection('sitemap_cache').find({}).toArray();
  
  console.log(`Loaded ${urls.length} URLs from cache`);
  
  inMemoryCache = urls.map(doc => ({ url: doc.url, slug: doc.slug }));
  inMemoryCacheTime = Date.now();
  
  return inMemoryCache;
}

async function matchKeywordsToUrls(urls, keywords) {
  if (!urls.length) return [];

  // Use database for smarter matching
  const matched = await sitemapCacheModel.findByKeywords(keywords, 10);
  
  console.log(`Matched ${matched.length} URLs for keywords: ${keywords.join(', ')}`);
  
  return matched;
}

async function scrapeTopCVPage(browser, url) {
  // Try FlareSolverr first (for VPS with Cloudflare protection)
  const html = await fetchWithFlareSolverr(url);
  if (html) {
    console.log(`[FlareSolverr] Got response for ${url}`);
    return extractJobsFromHtml(html);
  }

  // Fall back to direct Playwright (for local dev)
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.scraperTimeoutMs });
    await page.waitForTimeout(2000);
    
    const title = await page.title().catch(() => '');
    if (title.toLowerCase().includes('cloudflare') || title.toLowerCase().includes('attention')) {
      console.log('Cloudflare challenge detected');
      return [];
    }
    
    const jobs = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.job-item-search-result');
      
      cards.forEach(card => {
        const titleEl = card.querySelector('a[aria-label]');
        const imgEl = card.querySelector('.avatar img');
        const salaryEl = card.querySelector('label.salary span');
        const addressEl = card.querySelector('label.address span');
        const expEl = card.querySelector('label.exp span');
        
        const title = titleEl?.getAttribute('aria-label') || '';
        const link = titleEl?.getAttribute('href')?.split('?')[0] || '';
        const company = imgEl?.getAttribute('alt') || '';
        const salary = salaryEl?.textContent?.trim() || 'Thoả thuận';
        const location = addressEl?.textContent?.trim() || 'N/A';
        const experience = expEl?.textContent?.trim() || 'N/A';
        
        if (title && link && !link.includes('cloudflare') && !link.includes('5xx')) {
          results.push({
            title,
            company: company || 'TopCV',
            salary,
            location,
            experience,
            link: link.startsWith('http') ? link : `https://www.topcv.vn${link}`,
          });
        }
      });
      
      return results;
    });
    
    return jobs;
  } catch (err) {
    console.error(`Error scraping ${url}:`, err.message);
    return [];
  } finally {
    await page.close();
    await context.close();
  }
}

async function scrapeLinkedIn(browser, keyword, limit) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  try {
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=Vietnam`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: config.scraperTimeoutMs });
    await page.waitForTimeout(3000);
    
    const jobs = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.jobs-search-results__list-item');
      
      cards.forEach(card => {
        const titleEl = card.querySelector('.job-card-list__title');
        const companyEl = card.querySelector('.job-card-container__company-name');
        const locationEl = card.querySelector('.job-card-container__metadata-item');
        const linkEl = card.querySelector('.job-card-list__title');
        
        const title = titleEl?.textContent?.trim() || '';
        const company = companyEl?.textContent?.trim() || '';
        const location = locationEl?.textContent?.trim() || '';
        const link = linkEl?.getAttribute('href') || '';
        
        if (title) {
          results.push({
            title,
            company: company || 'LinkedIn',
            salary: 'Thoả thuận',
            location,
            experience: 'N/A',
            link: link.startsWith('http') ? link : `https://www.linkedin.com${link}`,
          });
        }
      });
      
      return results;
    });
    
    return jobs.slice(0, limit);
  } catch (err) {
    console.error('LinkedIn scrape error:', err.message);
    return [];
  } finally {
    await page.close();
    await context.close();
  }
}

async function scrapeITviec(browser, keyword, limit) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  try {
    const searchUrl = `https://itviec.com/it-jobs?query=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: config.scraperTimeoutMs });
    await page.waitForTimeout(3000);
    
    const jobs = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.job-card');
      
      cards.forEach(card => {
        const titleEl = card.querySelector('.job-card__title');
        const companyEl = card.querySelector('.job-card__name');
        const salaryEl = card.querySelector('.job-card__salary');
        const locationEl = card.querySelector('.job-card__location');
        const linkEl = card.querySelector('.job-card__title a');
        
        const title = titleEl?.textContent?.trim() || '';
        const company = companyEl?.textContent?.trim() || '';
        const salary = salaryEl?.textContent?.trim() || 'Thoả thuận';
        const location = locationEl?.textContent?.trim() || '';
        const link = linkEl?.getAttribute('href') || '';
        
        if (title) {
          results.push({
            title,
            company: company || 'ITviec',
            salary,
            location,
            experience: 'N/A',
            link: link.startsWith('http') ? link : `https://itviec.com${link}`,
          });
        }
      });
      
      return results;
    });
    
    return jobs.slice(0, limit);
  } catch (err) {
    console.error('ITviec scrape error:', err.message);
    return [];
  } finally {
    await page.close();
    await context.close();
  }
}

export async function scrapeJobs({ prompt, platforms, maxResults, locationPreference }) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (err) {
    throw new Error('Playwright is not installed. Please run npm install in backend.');
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ],
  });

  try {
    console.log(`\n=== AI Job Search ===`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Platforms: ${platforms.join(', ')}`);
    console.log(`Max results: ${maxResults}`);
    console.log(`Location preference: ${locationPreference || 'Any'}`);
    
    // Step 1: AI analyze prompt
    console.log('\n[1/4] Analyzing prompt with AI...');
    const analysis = await analyzePrompt(prompt);
    console.log(`Keywords: ${analysis.keywords.join(', ')}`);
    console.log(`Experience filter: ${analysis.experienceFilter || 'Any'}`);
    console.log(`Location filter: ${analysis.locationFilter || 'Any'}`);
    
    const effectiveLocation = locationPreference || analysis.locationFilter;
    const allJobs = [];
    const seenLinks = new Set();
    
    // Step 2: For each platform, scrape jobs
    for (const platform of platforms) {
      console.log(`\n[2/4] Scraping ${platform}...`);
      
      if (platform === 'TopCV') {
        // Step 2a: Fuzzy match keywords to get candidates
        const candidates = await matchKeywordsToUrls(await getCachedUrls(), analysis.keywords);
        console.log(`Fuzzy matched ${candidates.length} candidate URLs`);

        // Step 2b: AI selects relevant URLs from candidates
        console.log('[2/4] AI selecting relevant URLs...');
        const selectedUrls = await selectRelevantUrls(candidates, prompt, analysis);
        console.log(`AI selected ${selectedUrls.length} URLs: ${selectedUrls.map(u => u.slug).join(', ')}`);

        console.log(`Scraping ${selectedUrls.length} selected URLs...`);

        for (const urlObj of selectedUrls) {
          if (allJobs.length >= maxResults * 3) break; // Scrape more for filtering
          
          const jobs = await scrapeTopCVPage(browser, urlObj.url);
          console.log(`  ${urlObj.slug}: ${jobs.length} jobs`);
          
          for (const job of jobs) {
            if (!seenLinks.has(job.link)) {
              seenLinks.add(job.link);
              allJobs.push(job);
            }
          }
        }
      } else if (platform === 'LinkedIn') {
        const jobs = await scrapeLinkedIn(browser, analysis.keywords[0] || prompt, maxResults);
        for (const job of jobs) {
          if (!seenLinks.has(job.link)) {
            seenLinks.add(job.link);
            allJobs.push(job);
          }
        }
      } else if (platform === 'ITviec') {
        const jobs = await scrapeITviec(browser, analysis.keywords[0] || prompt, maxResults);
        for (const job of jobs) {
          if (!seenLinks.has(job.link)) {
            seenLinks.add(job.link);
            allJobs.push(job);
          }
        }
      }
    }
    
    console.log(`\nTotal scraped: ${allJobs.length} jobs`);
    
    // Step 3: Filter by location
    console.log('\n[3/4] Filtering by location...');
    let filteredJobs = allJobs;
    if (effectiveLocation) {
      filteredJobs = allJobs.filter(job => {
        const locMatch = matchLocation(job.location, effectiveLocation);
        return locMatch.match;
      });
      console.log(`After location filter: ${filteredJobs.length} jobs`);
    }
    
    // Step 4: AI filter and rank
    console.log('\n[4/4] AI filtering and ranking...');
    const ranked = await filterAndRankJobs(filteredJobs, analysis, effectiveLocation);
    
    const finalJobs = ranked.jobs
      .filter(j => j._score > 0)
      .slice(0, maxResults)
      .map((job, index) => ({
        id: index + 1,
        title: job.title,
        company: job.company,
        salary: job.salary || 'Thoả thuận',
        experience: job.experience || 'N/A',
        location: job.location || 'N/A',
        link: job.link,
        _reason: job._reason,
      }));
    
    console.log(`\nFinal results: ${finalJobs.length} jobs`);
    
    // Get location stats
    const locationStats = groupJobsByLocation(finalJobs);
    
    return {
      jobs: finalJobs,
      aiAnalysis: {
        keywords: analysis.keywords,
        experienceFilter: analysis.experienceFilter,
        locationFilter: effectiveLocation,
        scrapedJobs: allJobs.length,
        filteredJobs: filteredJobs.length,
        finalJobs: finalJobs.length,
      },
      locationStats,
      summary: ranked.summary,
    };
  } finally {
    await browser.close();
  }
}
