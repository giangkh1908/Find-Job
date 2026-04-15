import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '@/api'
import type { User } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<{ userId: string; email: string }>
  logout: () => Promise<void>
  verifyEmail: (userId: string, otp: string) => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = authApi.getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await authApi.getMe()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } catch {
        authApi.clearToken()
        localStorage.removeItem('user')
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)

    const userData: User = {
      userId: response.userId,
      email: response.email,
      isEmailVerified: response.isEmailVerified,
    }

    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (email: string, password: string) => {
    const response = await authApi.register(email, password)

    return {
      userId: response.userId,
      email: response.email,
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const verifyEmail = async (userId: string, otp: string) => {
    await authApi.verifyEmail(userId, otp)

    // Update user state
    if (user) {
      const updatedUser = { ...user, isEmailVerified: true }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verifyEmail,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
