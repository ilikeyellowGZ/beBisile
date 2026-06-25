import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { corsOrigins } from './config/env.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { checkoutRoutes } from './routes/checkout.routes.js';
import { paymentsRoutes } from './routes/payments.routes.js';
import { publicRoutes } from './routes/public.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { requireWakeJwt } from './middleware/wake.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export const app = express();
const clientDistPath = [
  path.resolve(process.cwd(), '..', 'dist'),
  path.resolve(process.cwd(), 'dist'),
].find((candidate) => fs.existsSync(path.join(candidate, 'index.html')));

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));
const healthLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const paymentLimiter = rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

app.get('/api/health', healthLimiter, (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health/protected', healthLimiter, requireWakeJwt, (_req, res) => {
  res.json({
    success: true,
    message: 'Backend is awake',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checkout', paymentLimiter, checkoutRoutes);
app.use('/api/payments', paymentLimiter, paymentsRoutes);
app.use('/api', publicRoutes);

if (clientDistPath) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(errorMiddleware);
