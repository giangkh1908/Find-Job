# Frontend - AI Job Aggregator

## Overview

React 19 + TypeScript + Vite frontend cho việc tìm kiếm việc làm với AI.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Animations**: Motion React
- **SEO**: react-helmet-async

## Features

- [x] Landing page với SEO
- [x] User authentication (Login, Register, OTP)
- [x] Protected routes
- [x] Job search với AI prompt
- [x] Real-time search progress
- [x] Results table với pagination
- [x] Platform selector (TopCV, LinkedIn, ITviec)
- [x] SEO meta tags + JSON-LD structured data
- [x] Google Analytics 4 integration
- [x] Responsive design

## Project Structure

```
src/
├── api/               # API calls
│   ├── authApi.ts     # Authentication API
│   └── jobApi.ts      # Job search API
├── components/
│   ├── home/          # Home page components
│   │   ├── HeroSection.tsx
│   │   ├── PlatformSelector.tsx
│   │   ├── ResultsTable.tsx
│   │   ├── SearchCriteria.tsx
│   │   └── SearchConfig.tsx
│   ├── layout/        # Header, Footer
│   ├── seo/           # SEO components
│   │   ├── SeoProvider.tsx
│   │   └── StructuredData.tsx
│   └── ui/            # Generic UI components
├── hooks/             # Custom React hooks
│   ├── useAuth.tsx    # Authentication context
│   └── useJobSearch.ts # Job search state
├── pages/
│   ├── HomePage.tsx   # Main app (protected)
│   ├── LandingPage.tsx # Public landing page
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── types/             # TypeScript types
├── styles/            # CSS files
├── App.tsx            # Root component
└── main.tsx          # Entry point
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Docker

```bash
# Build image
docker build -t frontend .

# Run container
docker run -p 80:80 frontend
```

## SEO

### Meta Tags

- Title, description, keywords
- Open Graph (Facebook)
- Twitter Cards
- Canonical URL

### Structured Data (JSON-LD)

- WebSite schema với SearchAction
- JobPosting schema cho job listings
- BreadcrumbList schema

### Files

```
public/
├── robots.txt         # Crawler directives
├── sitemap.xml       # Sitemap for Google
├── favicon.svg      # Favicon
└── og-image.png     # Social sharing image (1200x630px)
```

## Analytics

Google Analytics 4 tracking code: `G-N21JR401X7`

### Tracked Events

- Page views
- User sessions
- Search queries
- Job clicks

## Routing

```
/                       → LandingPage (public)
/login                  → LoginPage (public)
/register               → RegisterPage (public)
/home                   → HomePage (protected)
```

## Authentication Flow

```
1. User registers → OTP sent to email
2. User verifies OTP → Account active
3. User logs in → JWT tokens stored
4. Protected routes check token validity
5. Token refresh on 401 response
```

## Components

### Search Flow

```
SearchCriteria (prompt input)
    ↓
SearchConfig (maxResults, location)
    ↓
PlatformSelector (TopCV, LinkedIn, ITviec)
    ↓
ActionButton → Triggers search
    ↓
useJobSearch → API call
    ↓
ResultsTable → Display jobs
```

## Deployment

### Docker Compose

```yaml
services:
  frontend:
    image: ghcr.io/username/find-job/frontend:latest
    ports:
      - "80:80"
```

### Nginx Config

- SPA fallback to index.html
- Gzip compression
- Static asset caching (1 year)
- Security headers
- API proxy to backend
