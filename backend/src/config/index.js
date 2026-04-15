/**
 * Config - Environment variables
 */
import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'ai_agent',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6379,

  // SMTP
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM || 'noreply@example.com',
  smtpFromName: process.env.SMTP_FROM_NAME || 'Find Job',

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Job search worker
  chromeUserDataDir: process.env.CHROME_USER_DATA_DIR || '.playwright-profile',
  jobQueuePollMs: Number(process.env.JOB_QUEUE_POLL_MS || 2000),
  jobQueueMaxAttempts: Number(process.env.JOB_QUEUE_MAX_ATTEMPTS || 3),
  scraperConcurrency: Number(process.env.SCRAPER_CONCURRENCY || 2),
  scraperTimeoutMs: Number(process.env.SCRAPER_TIMEOUT_MS || 45000),
  scraperJobTimeoutMs: Number(process.env.SCRAPER_JOB_TIMEOUT_MS || 120000),
  scraperMaxResults: Number(process.env.SCRAPER_MAX_RESULTS || 50),

  // AI provider (OpenRouter)
  openrouterApiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
  openrouterModel: process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4',
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  openrouterAppName: process.env.OPENROUTER_APP_NAME || 'ai-job-aggregator',
  openrouterReferer: process.env.OPENROUTER_REFERER || 'http://localhost:5173',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 15000),
  aiRerankCandidateLimit: Number(process.env.AI_RERANK_CANDIDATE_LIMIT || 30),
  aiAgentMaxSteps: Number(process.env.AI_AGENT_MAX_STEPS || 8),
  aiAgentObservationItems: Number(process.env.AI_AGENT_OBSERVATION_ITEMS || 12),

  // FlareSolverr (Cloudflare bypass)
  flareSolverrUrl: process.env.FLARESOLVERR_URL || '',
};
