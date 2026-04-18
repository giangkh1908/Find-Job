/**
 * Auth Middleware
 */
import { tokenService } from '../services/tokenService.js';
import { error } from '../utils/response.js';

import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'No token provided', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return error(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    }
    return error(res, 'Invalid or expired token', 401, 'UNAUTHORIZED');
  }
}
