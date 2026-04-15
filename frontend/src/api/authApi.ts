import type { AuthResponse, RegisterResponse, VerifyEmailResponse } from '@/types/auth'

const API_BASE = 'http://103.82.25.191/api'

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data.data || data
}

export const authApi = {
  register: async (email: string, password: string): Promise<RegisterResponse> => {
    return fetchApi<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Save token
    if (data.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken)
    }

    return data.data
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('accessToken')
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      // Logout API có thể fail nhưng vẫn clear local
      console.log('Logout API response:', response.status)
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  },

  verifyEmail: async (userId: string, otp: string): Promise<VerifyEmailResponse> => {
    return fetchApi<VerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ userId, otp }),
    })
  },

  resendOtp: async (email: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  getMe: async (): Promise<{ userId: string; email: string; isEmailVerified: boolean }> => {
    return fetchApi('/auth/me')
  },

  getToken: (): string | null => {
    return localStorage.getItem('accessToken')
  },

  setToken: (token: string): void => {
    localStorage.setItem('accessToken', token)
  },

  clearToken: (): void => {
    localStorage.removeItem('accessToken')
  },
}
