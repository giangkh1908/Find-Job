/**
 * Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  const status = err.status || 500;
  const message = err.status === 500 ? 'Internal Server Error' : err.message;
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    success: false,
    error: message,
    code,
  });
}
