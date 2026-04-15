/**
 * Job Worker - queue consumer lifecycle
 */
import { config } from '../config/index.js';
import { jobQueue } from './jobQueue.js';
import { scrapeJobs } from './jobScraper.js';
import { jobSearchModel } from '../models/jobSearchModel.js';

let intervalRef = null;
let inFlight = 0;
let isTicking = false;

async function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timer = null;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function processOne(job) {
  const { searchId, payload } = job;

  await jobSearchModel.update(searchId, {
    status: 'running',
    progress: 20,
    error: null,
    startedAt: new Date(),
  });

  try {
    const results = await withTimeout(
      scrapeJobs(payload),
      config.scraperJobTimeoutMs,
      `Search timed out after ${config.scraperJobTimeoutMs}ms`
    );

    await jobSearchModel.setResults(searchId, results);
    await jobSearchModel.update(searchId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown worker error';
    const attempts = job.attempts || 0;
    const canRetry = attempts + 1 < config.jobQueueMaxAttempts;

    if (canRetry) {
      await jobQueue.retry(job, message);
      await jobSearchModel.update(searchId, {
        status: 'queued',
        progress: 0,
        error: `Retrying: ${message}`,
      });
      return;
    }

    await jobSearchModel.update(searchId, {
      status: 'failed',
      progress: 100,
      error: message,
      completedAt: new Date(),
    });
  }
}

async function tick() {
  if (isTicking) return;
  isTicking = true;

  try {
    while (inFlight < config.scraperConcurrency) {
      const job = await jobQueue.getNext();
      if (!job) break;

      inFlight += 1;
      processOne(job)
        .catch(err => {
          console.error('Worker process failed:', err.message);
        })
        .finally(() => {
          inFlight -= 1;
        });
    }
  } finally {
    isTicking = false;
  }
}

export function startJobWorker() {
  if (intervalRef) return;

  intervalRef = setInterval(() => {
    tick().catch(err => {
      console.error('Worker tick error:', err.message);
    });
  }, config.jobQueuePollMs);

  console.log(`Job worker started (poll=${config.jobQueuePollMs}ms, concurrency=${config.scraperConcurrency})`);
}

export function stopJobWorker() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}
