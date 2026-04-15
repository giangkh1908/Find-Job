/**
 * Entry Point
 */
import app from './app.js';
import { config } from './config/index.js';
import { connectDB, closeDB } from './config/database/connection.js';
import { setupUserModel } from './models/userModel.js';
import { setupJobSearchModel } from './models/jobSearchModel.js';
import { setupSitemapCacheModel } from './models/sitemapCacheModel.js';
import { getRedis, closeRedis } from './utils/redisClient.js';
import { emailQueue } from './services/emailQueue.js';
import { emailProvider } from './services/emailProvider.js';
import { startJobWorker, stopJobWorker } from './services/jobWorker.js';
import { startSitemapScheduler, stopSitemapScheduler } from './services/sitemapScheduler.js';

console.log('Starting...');

async function start() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    await setupUserModel();
    await setupJobSearchModel();
    await setupSitemapCacheModel();
    console.log('MongoDB connected');

    getRedis();

    // Start sitemap scheduler (cronjob every 12h)
    startSitemapScheduler();

    startJobWorker();

    setInterval(async () => {
      const job = await emailQueue.getNext();
      if (job) {
        await emailProvider.send(job.type, job.data);
      }
    }, 5000);

    const server = app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      server.close(async () => {
        stopSitemapScheduler();
        stopJobWorker();
        await closeRedis();
        await closeDB();
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
