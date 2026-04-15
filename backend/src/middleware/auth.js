/**
 * Auth Middleware
 */
import { tokenService } from '../services/tokenService.js';
import { error } from '../utils/response.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'No token provided', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  const decoded = tokenService.verifyAccessToken(token);

  if (!decoded) {
    return error(res, 'Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  req.user = decoded;
  next();
}
