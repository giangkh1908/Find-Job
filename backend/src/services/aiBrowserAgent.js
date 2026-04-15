/**
 * AI Browser Agent - AI decides Playwright tool actions step-by-step.
 */
import { config } from '../config/index.js';
import { aiProvider } from './aiProvider.js';

function toText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function dedupeJobs(jobs) {
  const seen = new Set();
  const output = [];

  for (const job of jobs) {
    if (!job?.link) continue;
    if (seen.has(job.link)) continue;
    seen.add(job.link);
    output.push(job);
  }

  return output;
}

async function summarizePage(page) {
  return page.evaluate((limit) => {
    const links = Array.from(document.querySelectorAll('a[href]'))
      .slice(0, limit)
      .map((el, i) => ({
        index: i,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        href: el.getAttribute('href') || '',
      }))
      .filter(item => item.text || item.href);

    const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]'))
      .slice(0, limit)
      .map((el, i) => ({
        index: i,
        text: (el.textContent || el.getAttribute('value') || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      }))
      .filter(item => item.text);

    const inputs = Array.from(document.querySelectorAll('input, textarea'))
      .slice(0, limit)
      .map((el, i) => ({
        index: i,
        placeholder: (el.getAttribute('placeholder') || '').slice(0, 100),
        name: (el.getAttribute('name') || '').slice(0, 80),
        type: (el.getAttribute('type') || 'text').slice(0, 20),
      }));

    const bodySnippet = (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1000);

    return {
      url: location.href,
      title: document.title,
      links,
      buttons,
      inputs,
      bodySnippet,
    };
  }, config.aiAgentObservationItems);
}

async function extractJobsFromCurrentPage(page, platform) {
  const raw = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    return links
      .map(link => {
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('javascript:') || href.startsWith('#')) return null;

        let absoluteLink = null;
        try {
          absoluteLink = new URL(href, window.location.origin).href;
        } catch {
          absoluteLink = null;
        }
        if (!absoluteLink) return null;

        const title = (link.textContent || '').replace(/\s+/g, ' ').trim();
        if (title.length < 6) return null;

        const row = link.closest('li, article, div');
        const rowText = (row?.textContent || '').replace(/\s+/g, ' ').trim();

        return {
          title,
          company: '',
          salary: '',
          experience: '',
          location: '',
          link: absoluteLink,
          contextText: rowText,
        };
      })
      .filter(Boolean)
      .slice(0, 200);
  });

  return raw.map((item, index) => ({
    id: index + 1,
    title: toText(item.title) || 'Unknown title',
    company: toText(item.company) || platform,
    salary: toText(item.salary) || 'Thoả thuận',
    experience: toText(item.experience) || 'N/A',
    location: toText(item.location) || 'N/A',
    link: item.link,
  }));
}

async function executeAction(page, action, keyword) {
  const type = action?.action;

  if (type === 'navigate' && action.url) {
    await page.goto(action.url, { waitUntil: 'domcontentloaded', timeout: config.scraperTimeoutMs });
    return 'navigated';
  }

  if (type === 'click_link' && Number.isInteger(action.index) && action.index >= 0) {
    const link = page.locator('a[href]').nth(action.index);
    await link.click({ timeout: 8000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => null);
    return `clicked link ${action.index}`;
  }

  if (type === 'click_button' && Number.isInteger(action.index) && action.index >= 0) {
    const button = page.locator('button, [role="button"], input[type="submit"]').nth(action.index);
    await button.click({ timeout: 8000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => null);
    return `clicked button ${action.index}`;
  }

  if (type === 'type_input' && Number.isInteger(action.index) && action.index >= 0) {
    const value = action.text || keyword;
    const input = page.locator('input, textarea').nth(action.index);
    await input.fill(value, { timeout: 8000 });
    return `typed input ${action.index}`;
  }

  if (type === 'wait') {
    const ms = Math.max(500, Math.min(5000, Number(action.ms) || 1200));
    await page.waitForTimeout(ms);
    return `waited ${ms}ms`;
  }

  if (type === 'extract_jobs') {
    return 'extract';
  }

  if (type === 'done') {
    return 'done';
  }

  return 'noop';
}

export async function runAIBrowserAgent({ page, platform, keyword }) {
  if (!aiProvider.isEnabled()) {
    return [];
  }

  const history = [];
  let collected = [];

  for (let step = 0; step < config.aiAgentMaxSteps; step += 1) {
    const observation = await summarizePage(page);
    const action = await aiProvider.decideBrowserAction({
      platform,
      keyword,
      observation,
      history,
    });

    try {
      const outcome = await executeAction(page, action, keyword);

      if (outcome === 'extract') {
        const extracted = await extractJobsFromCurrentPage(page, platform);
        collected = dedupeJobs([...collected, ...extracted]);
      }

      history.push({ step: step + 1, action, outcome });

      if (outcome === 'done') {
        break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown action error';
      history.push({ step: step + 1, action, outcome: `error: ${message}` });
    }
  }

  if (!collected.length) {
    const fallback = await extractJobsFromCurrentPage(page, platform);
    collected = dedupeJobs(fallback);
  }

  return collected.slice(0, config.scraperMaxResults);
}
