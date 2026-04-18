# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend
- Install: `cd backend && npm install`
- Run Dev: `cd backend && npm run dev`
- Lint: `cd backend && npm run lint`

### Frontend
- Install: `cd frontend && npm install`
- Run Dev: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`
- Preview: `cd frontend && npm run preview`

### Docker & Infrastructure
- Local Dev: `docker compose -f docker-compose.yml up -d`
- Production: `docker compose -f docker-compose.prod.yml up -d`
- Check Health: `curl https://your-domain.com/health`

## Architecture & Structure

The project is a Monorepo consisting of a Node.js backend and a React frontend.

### Backend (`/backend`)
Node.js + Express API using MongoDB and Redis.
- `src/config/`: Environment variables and configuration.
- `src/controllers/`: HTTP request handlers.
- `src/middleware/`: Authentication and validation logic.
- `src/models/`: MongoDB schemas.
- `src/routes/`: API route definitions.
- `src/services/`: Business logic and external integrations (e.g., Playwright scraping, OpenRouter AI).
- `src/utils/`: Helper functions.

**Key Technical Details:**
- **Scraping**: Uses Playwright for headless browser automation.
- **Background Tasks**: Uses Redis for job queue processing.
- **AI Integration**: Uses OpenRouter (Claude Sonnet) for analyzing natural language search prompts.

### Frontend (`/frontend`)
React 19 + TypeScript + Vite.
- `src/api/`: API client and request definitions.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks.
- `src/pages/`: Main page components.
- `src/types/`: TypeScript type definitions.

**Key Technical Details:**
- **Styling**: Tailwind CSS.
- **Animations**: Motion.
- **Icons**: Lucide React.
