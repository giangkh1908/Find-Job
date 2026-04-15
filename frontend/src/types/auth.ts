export interface User {
  userId: string
  email: string
  isEmailVerified?: boolean
  createdAt?: string
}

export interface AuthResponse {
  userId: string
  email: string
  isEmailVerified: boolean
  accessToken: string
  message?: string
}

export interface RegisterResponse {
  userId: string
  email: string
  message: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
}
