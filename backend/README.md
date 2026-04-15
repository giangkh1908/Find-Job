# Backend - AI Job Aggregator API

## Overview

Node.js + Express backend với MongoDB, Redis, và Playwright cho việc scrape jobs.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Cache**: Redis
- **Authentication**: JWT + OTP
- **AI**: OpenRouter API (Claude Sonnet)
- **Scraping**: Playwright + Chromium

## Features

- [x] User authentication (Register, Login, OTP verification)
- [x] JWT tokens with refresh mechanism
- [x] AI-powered job search (prompt → keywords → scrape → rank)
- [x] Sitemap caching (12h cronjob)
- [x] Multi-platform scraping (TopCV, LinkedIn, ITviec)
- [x] Job filtering by experience, location
- [x] Redis job queue

## Project Structure

```
src/
├── config/           # Environment variables
├── controllers/      # HTTP handlers
├── middleware/       # Auth, validation, error handling
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/       # Business logic
│   ├── authService.js      # Authentication
│   ├── jobService.js      # Job search orchestration
│   ├── jobScraper.js      # Playwright scraping
│   ├── jobWorker.js       # Background job processor
│   ├── jobQueue.js        # Redis job queue
│   ├── promptAnalyzer.js   # AI prompt analysis
│   ├── sitemapScheduler.js # Sitemap sync cronjob
│   └── sitemapService.js  # Sitemap fetch
├── utils/          # Helpers (response, redis, etc.)
├── validators/     # Zod schemas
├── app.js          # Express setup
└── index.js       # Entry point
```

## Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=ai_agent

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-64-char-random-string
JWT_REFRESH_SECRET=another-64-char-random-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com

# Scraper
SCRAPER_MAX_RESULTS=20
SCRAPER_JOB_TIMEOUT_MS=180000
SCRAPER_CONCURRENCY=1

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_MODEL=anthropic/claude-sonnet-4
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify OTP |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/search` | Create job search task |
| GET | `/api/jobs/:id/status` | Get search status |
| GET | `/api/jobs/:id/results` | Get search results |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production
npm start

# Lint
npm run lint
```

## Docker

```bash
# Build image
docker build -t backend .

# Run container
docker run -p 3000:3000 --env-file .env backend
```

## Database Indexes

```javascript
// users collection
{ email: 1 }           // unique
{ createdAt: -1 }

// job_searches collection
{ searchId: 1 }        // unique
{ userId: 1, createdAt: -1 }
{ status: 1, updatedAt: -1 }

// sitemap_cache collection
{ url: 1 }             // unique
{ fetchedAt: -1 }
```
