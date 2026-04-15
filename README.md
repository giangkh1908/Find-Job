# Find-Job - AI Job Aggregator

Tìm kiếm việc làm thông minh với AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MongoDB Atlas account
- OpenRouter API key (optional)

### Local Development

```bash
# Clone repository
git clone https://github.com/giangkh1908/Find-Job.git
cd Find-Job

# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Docker (Production)

```bash
# Build and run
docker compose -f docker-compose.yml up -d

# Or for production
docker compose -f docker-compose.prod.yml up -d
```

---

## 📁 Project Structure

```
Find-Job/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Environment variables
│   │   ├── controllers/    # HTTP handlers
│   │   ├── middleware/    # Auth, validation
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helpers
│   ├── Dockerfile
│   └── README.md
│
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/   # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── README.md
│
├── docker-compose.yml      # Local development
├── docker-compose.prod.yml # Production deployment
├── .env.production.example
└── README.md              # This file
```

---

## 🎯 Features

### Core Features

- [x] **AI-Powered Search**: Nhập yêu cầu bằng ngôn ngữ tự nhiên
- [x] **Multi-Platform**: TopCV, LinkedIn, ITviec
- [x] **Smart Filtering**: Lọc theo kinh nghiệm, địa điểm
- [x] **User Authentication**: Register, Login, OTP verification
- [x] **JWT Tokens**: Access token + Refresh token
- [x] **Sitemap Caching**: 12h cronjob, lưu vào MongoDB

### Technical Features

- [x] **Playwright Scraping**: Headless browser automation
- [x] **Redis Queue**: Background job processing
- [x] **OpenRouter AI**: Claude Sonnet cho prompt analysis
- [x] **SEO Optimized**: Meta tags, JSON-LD, sitemap
- [x] **Google Analytics 4**: Tracking users & behavior
- [x] **Docker Ready**: Full containerization
- [x] **CI/CD**: GitHub Actions auto-deploy

---

## 🔧 Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js 20 | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Redis | Cache & Queue |
| Playwright | Web scraping |
| JWT | Authentication |
| Zod | Validation |
| Nodemailer | Email OTP |

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router | Routing |
| Lucide React | Icons |
| Motion | Animations |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| GitHub Actions | CI/CD |
| GHCR | Container registry |
| Cloudflare | DNS & SSL |
| MongoDB Atlas | Cloud database |

---

## 🌐 API Endpoints

### Authentication

```
POST /api/auth/register     - Register new user
POST /api/auth/login       - Login
POST /api/auth/verify-email - Verify OTP
POST /api/auth/logout      - Logout
POST /api/auth/refresh     - Refresh token
GET  /api/auth/me          - Get current user
```

### Jobs

```
POST /api/jobs/search      - Create job search task
GET  /api/jobs/:id/status  - Get search status
GET  /api/jobs/:id/results - Get search results
```

### Health

```
GET /health                - Health check
```

---

## 🔐 Environment Variables

### Backend (.env)

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

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI
OPENROUTER_API_KEY=sk-or-v1-xxx
```

---

## 🚢 Deployment

### 1. VPS Setup

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Chạy setup script
curl -fsSL https://get.docker.com | sh

# Tạo deploy user
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh

# Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. Clone & Configure

```bash
# SSH as deploy user
ssh deploy@your-vps-ip

# Clone repo
git clone https://github.com/giangkh1908/Find-Job.git app
cd app

# Create .env
cp .env.production.example .env
nano .env  # Edit with your credentials
```

### 3. Deploy

```bash
# Local development
docker compose -f docker-compose.yml up -d

# Production (với Docker Hub/GHCR)
docker compose -f docker-compose.prod.yml up -d
```

### 4. CI/CD (GitHub Actions)

Push code lên `main` → GitHub Actions tự động:
1. Build Docker images
2. Push lên GHCR
3. Deploy lên VPS

---

## 📊 Monitoring

### Health Check

```bash
curl https://your-domain.com/health
```

### Docker Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

### Docker Stats

```bash
docker stats
```

---

## 🛠️ Development

### Backend

```bash
cd backend

# Install dependencies
npm install

# Run development
npm run dev

# Lint
npm run lint
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 📝 License

MIT License - xem [LICENSE](LICENSE) file.

---

## 👤 Author

**Kim Giang**

- GitHub: [@giangkh1908](https://github.com/giangkh1908)
- Email: quangvu1922@gmail.com

---

## 🙏 Acknowledgments

- [TopCV](https://www.topcv.vn) - Job listings
- [LinkedIn](https://www.linkedin.com) - Job listings
- [ITviec](https://www.itviec.com) - Job listings
- [OpenRouter](https://openrouter.ai) - AI API
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database
