/**
 * Auth Controller
 */
import { success, error } from '../utils/response.js';
import { authService } from '../services/authService.js';

export const authController = {
  // Register
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  // Login
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  // Verify email
  async verifyEmail(req, res, next) {
    try {
      const result = await authService.verifyEmail(req.body);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  // Resend OTP
  async resendOtp(req, res, next) {
    try {
      const result = await authService.resendOtp(req.body);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  // Logout
  async logout(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await authService.logout(userId);
      }
      res.clearCookie('refreshToken');
      success(res, { message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  },

  // Refresh token
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await authService.refreshToken(refreshToken);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  // Get current user
  async me(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return error(res, 'Unauthorized', 401);
      }
      const user = await authService.getUser(userId);
      success(res, user);
    } catch (err) {
      next(err);
    }
  },
};
