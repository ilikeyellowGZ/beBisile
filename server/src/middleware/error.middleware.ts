import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.statusCode || 500;
  const message = error.message || 'Server error';
  res.status(status).json({ success: false, message, error: message });
};
