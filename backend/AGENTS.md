# Backend Code Conventions (MVC)

## Project Structure

```
src/
├── config/                  # Configuration
│   ├── index.js           # Environment variables
│   └── database/
│       └── connection.js   # MongoDB connection
├── models/                  # Data access
│   ├── schema/
│   │   ├── index.js       # Schema exports
│   │   └── userSchema.js  # User schema definition
│   └── userModel.js       # User CRUD operations
├── controllers/            # HTTP handlers
│   └── authController.js
├── services/               # Business logic
│   ├── authService.js
│   ├── tokenService.js
│   ├── emailQueue.js
│   └── emailProvider.js
├── routes/                 # API routes
│   └── authRoutes.js
├── middleware/             # Express middleware
│   ├── auth.js
│   ├── validate.js
│   └── errorHandler.js
├── validators/             # Zod schemas (HTTP validation)
│   └── authValidator.js
├── utils/                  # Helpers
│   ├── response.js
│   ├── helpers.js
│   └── redisClient.js
├── app.js                  # Express setup
└── index.js                # Entry point
```

## Schema vs Model

```js
// models/schema/userSchema.js - Data structure definition
export const userSchema = {
  collection: 'users',
  fields: {
    email: { type: 'string', required: true },
    passwordHash: { type: 'string', required: true },
    isEmailVerified: { type: 'boolean', default: false },
    // ...
  },
  indexes: [
    { email: 1, unique: true },
  ],
};

// models/userModel.js - Data access operations
import { userSchema } from './schema/userSchema.js';

export const userModel = {
  async findByEmail(email) {
    // use userSchema.collection
  },
};
```

## MVC Pattern

```
Request → Routes → Middleware → Controller → Service → Model → Database
                ↑                           ↓
                └─────────── Response ←────┘
```

## Flow: Register User

```
POST /api/auth/register
    │
    ▼
authRoutes.js (validate)
    │
    ▼
authController.register()
    │
    ▼
authService.register()
    │
    ├─► userModel.findByEmail()
    ├─► bcrypt.hash()
    ├─► userModel.create()
    ├─► tokenService.generateOTP()
    └─► emailQueue.add()
    │
    ▼
authController.register()
    │
    ▼
success(res, result, 201)
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| File | camelCase | `authService.js`, `userModel.js` |
| Function | camelCase | `findByEmail`, `generateOTP` |
| Route URL | kebab-case | `/api/auth/register` |

## Model Rules

- MongoDB queries in models
- CRUD methods
- No business logic

## Controller Rules

- **THIN** - only HTTP handling
- Call service, return response
- try-catch + next(error)

## Service Rules

- Business logic
- Call model for data
- No HTTP code

## Validators

```js
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

## Response Format

```js
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "message", code: "ERROR_CODE" }
```

## API Endpoints

```
POST /api/auth/register     - Register
POST /api/auth/login        - Login
POST /api/auth/verify-email - Verify OTP
POST /api/auth/resend-otp  - Resend OTP
POST /api/auth/logout       - Logout (protected)
POST /api/auth/refresh      - Refresh token
GET  /api/auth/me          - Get user (protected)
GET  /health              - Health check
```

## Commands

```bash
npm run dev      # node --watch src/index.js
npm run start    # node src/index.js
npm run lint     # eslint src --ext .js
```

## Tech Stack

- Express.js
- JavaScript (ES6+)
- MongoDB
- Zod (validation)
- bcryptjs (password)
- jsonwebtoken (JWT)
- nodemailer (email)
- ioredis (Redis)
- dotenv
