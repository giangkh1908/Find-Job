/**
 * Auth Service - Business Logic
 */
import bcrypt from 'bcryptjs';
import { userModel } from '../models/userModel.js';
import { tokenService } from './tokenService.js';
import { emailQueue } from './emailQueue.js';

// Custom errors
export class AuthError extends Error {
  constructor(message, status = 400, code = null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const authService = {
  // Register
  async register({ email, password }) {
    // Check email exists
    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new AuthError('Email already registered', 409, 'CONFLICT');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await userModel.create({ email, passwordHash });

    // Generate OTP and send email
    const otp = tokenService.generateOTP();
    await userModel.saveOtp(user._id.toString(), otp);
    await emailQueue.add('verify-email', { email, otp });

    return {
      userId: user._id.toString(),
      email: user.email,
      message: 'Registration successful. Please verify your email.',
    };
  },

  // Login
  async login({ email, password }) {
    // Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AuthError('Invalid credentials', 401, 'UNAUTHORIZED');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AuthError('Invalid credentials', 401, 'UNAUTHORIZED');
    }

    // Check email verified
    if (!user.isEmailVerified) {
      throw new AuthError('Please verify your email first', 401, 'UNAUTHORIZED');
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user);
    const newVersion = user.refreshTokenVersion + 1;
    const refreshToken = tokenService.generateRefreshToken(user, newVersion);

    // Save refresh token
    await userModel.saveRefreshToken(user._id.toString(), refreshToken, newVersion);

    return {
      userId: user._id.toString(),
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      accessToken,
    };
  },

  // Verify email with OTP
  async verifyEmail({ userId, otp }) {
    const isValid = await userModel.verifyOtp(userId, otp);
    if (!isValid) {
      throw new AuthError('Invalid or expired OTP', 401, 'UNAUTHORIZED');
    }

    await userModel.markEmailVerified(userId);
    await emailQueue.add('welcome', { email: (await userModel.findById(userId)).email });

    return { success: true, message: 'Email verified successfully' };
  },

  // Resend OTP
  async resendOtp({ email }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AuthError('User not found', 404, 'NOT_FOUND');
    }

    if (user.isEmailVerified) {
      throw new AuthError('Email already verified', 400, 'BAD_REQUEST');
    }

    // Check if locked
    if (user.otpLockedUntil && new Date() < user.otpLockedUntil) {
      const remaining = Math.ceil((user.otpLockedUntil - Date.now()) / 60000);
      throw new AuthError(`Too many attempts. Try again in ${remaining} minutes.`, 429, 'RATE_LIMITED');
    }

    const otp = tokenService.generateOTP();
    await userModel.saveOtp(user._id.toString(), otp);
    await emailQueue.add('verify-email', { email, otp });

    return { success: true, message: 'OTP sent successfully' };
  },

  // Logout
  async logout(userId) {
    await userModel.clearRefreshToken(userId);
    return { success: true, message: 'Logged out successfully' };
  },

  // Refresh token
  async refreshToken(refreshToken) {
    const decoded = tokenService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AuthError('Invalid refresh token', 401, 'UNAUTHORIZED');
    }

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      throw new AuthError('User not found', 404, 'NOT_FOUND');
    }

    const isValid = await userModel.verifyRefreshToken(user._id.toString(), refreshToken);
    if (!isValid) {
      throw new AuthError('Refresh token revoked', 401, 'UNAUTHORIZED');
    }

    // Rotation: Generate new access AND refresh tokens
    const accessToken = tokenService.generateAccessToken(user);
    const newVersion = user.refreshTokenVersion + 1;
    const newRefreshToken = tokenService.generateRefreshToken(user, newVersion);

    // Save new refresh token and increment version
    await userModel.saveRefreshToken(user._id.toString(), newRefreshToken, newVersion);

    return { accessToken, refreshToken: newRefreshToken };
  },

  // Get user
  async getUser(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new AuthError('User not found', 404, 'NOT_FOUND');
    }
    return {
      userId: user._id.toString(),
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  },
};
