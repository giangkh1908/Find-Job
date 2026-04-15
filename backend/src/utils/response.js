/**
 * Response Helpers
 */
export function success(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

export function error(res, message, status = 400, code = null) {
  res.status(status).json({ success: false, error: message, code });
}
