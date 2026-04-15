# Frontend Code Conventions

## Project Structure

```
src/
├── api/              # API calls & services
│   ├── index.ts
│   ├── authApi.ts    # Authentication API
│   └── jobApi.ts
├── components/       # Reusable UI components
│   ├── home/         # Components for HomePage
│   ├── layout/       # Header, Footer
│   └── ui/           # Generic UI components
├── constants/        # Constants & config
├── hooks/            # Custom React hooks
│   ├── index.ts
│   ├── useAuth.tsx  # Authentication hook
│   └── useJobSearch.ts
├── pages/            # Page components
│   ├── index.ts
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── HomePage.tsx
├── states/           # State management
├── styles/           # CSS files
├── types/            # TypeScript types
│   ├── index.ts
│   └── auth.ts      # Auth types
├── App.tsx          # Root component with routing
└── main.tsx         # Entry point
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        Auth Flow                             │
├─────────────────────────────────────────────────────────────┤
│  /login     → LoginPage → authApi.login() → save token    │
│  /register  → RegisterPage → authApi.register() → OTP sent │
│  /          → Protected (AuthProvider checks token)        │
└─────────────────────────────────────────────────────────────┘
```

## AuthProvider (useAuth)

```tsx
// src/hooks/useAuth.tsx
const { user, isAuthenticated, isLoading, login, register, logout } = useAuth()
```

| Method | Description |
|--------|-------------|
| `login(email, password)` | Login, save token to localStorage |
| `register(email, password)` | Register, return userId + email |
| `logout()` | Clear token and user state |
| `verifyEmail(userId, otp)` | Verify email with OTP |
| `isAuthenticated` | Boolean - is user logged in |

## API Auth (src/api/authApi.ts)

```tsx
authApi.login(email, password)      // Returns { userId, email, accessToken }
authApi.register(email, password)   // Returns { userId, email, message }
authApi.verifyEmail(userId, otp)   // Verify OTP
authApi.logout()                   // Logout
authApi.getMe()                    // Get current user
```

## Protected Routes

```tsx
// App.tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Auto-redirect to /login if not authenticated
// Auto-redirect to / if already authenticated (for login/register)
```

## Pages

### LoginPage
- Email + Password form
- Error handling
- Link to register

### RegisterPage
- 2-step flow: Form → OTP Verification
- Email + Password + Confirm Password
- OTP input for email verification

## Components

```tsx
// src/components/ui/Toggle.tsx
export interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="space-y-0.5">
        <label className="font-semibold text-slate-900">{label}</label>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button onClick={() => onChange(!checked)} className={`...`}>
        <span className={`... ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
```

## Hooks

```tsx
// src/hooks/useJobSearch.ts
import { useState, useCallback } from 'react'
import type { Job } from '@/types'

export function useJobSearch() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Job[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const search = useCallback(async () => {
    setIsSearching(true)
    // fetch results...
    setIsSearching(false)
  }, [keyword])

  return { keyword, setKeyword, results, isSearching, search }
}
```

## CSS / Tailwind

```tsx
// Tailwind classes trực tiếp trong JSX
<div className="card p-6 space-y-4">
  <h3 className="font-bold text-slate-800">Title</h3>
</div>

// Custom component classes trong styles/index.css
@layer components {
  .card {
    @apply bg-white rounded-2xl border border-slate-200 shadow-sm;
  }
  
  .input-field {
    @apply w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand;
  }
  
  .btn-primary {
    @apply px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl;
  }
}
```

## Path Alias

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Commands

```bash
npm run dev      # Dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # Preview production
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router DOM v6
- Lucide React (icons)
- Motion React (animations)
- Path alias `@/` → `./src/`

## API Base URL

```
http://localhost:3000/api
```
