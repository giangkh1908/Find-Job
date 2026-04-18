/**
 * Token Service
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';

export const tokenService = {
  // Generate access token
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  },

  // Generate refresh token
  generateRefreshToken(user, version = 0) {
    return jwt.sign(
      { userId: user._id.toString(), version },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );
  },

  // Verify access token
  verifyAccessToken(token) {
    return jwt.verify(token, config.jwtSecret);
  },

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwtRefreshSecret);
    } catch {
      return null;
    }
  },

  // Generate 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  },
};
