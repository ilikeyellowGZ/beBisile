import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.statusCode || 500;
  res.status(status).json({ error: error.message || 'Server error' });
};
