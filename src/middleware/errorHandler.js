export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  if (err.code === 'PGRST116') {
    return res.status(404).json({ error: 'Not Found', message: 'Resource not found' });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    code: err.code || null,
  });
}
