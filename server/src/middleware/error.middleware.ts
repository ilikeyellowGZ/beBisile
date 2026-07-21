import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const details = error as { statusCode?: number; status?: number; code?: number; name?: string; message?: string };
  const isProduction = process.env.NODE_ENV === 'production';
  const status = Number(details.statusCode || details.status || (details.code === 11000 ? 409 : 500));
  const safeStatus = Number.isInteger(status) && status >= 400 && status < 600 ? status : 500;
  const isClientError = safeStatus < 500;
  const message = details.name === 'CastError'
    ? 'The requested record ID is invalid.'
    : details.code === 11000
      ? 'A record with these details already exists.'
      : (!isProduction || isClientError) && details.message
        ? details.message
        : 'Server error';
  console.error('API error', { status, message, stack: error instanceof Error ? error.stack : undefined });
  res.status(safeStatus).json({ success: false, message, ...(isClientError ? { error: message } : {}) });
};
