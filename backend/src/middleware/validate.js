/**
 * Validation Middleware
 */
import { error } from '../utils/response.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = result.error.errors.map(e => e.message).join(', ');
      return error(res, messages, 400, 'VALIDATION_ERROR');
    }

    req.body = result.data;
    next();
  };
}
