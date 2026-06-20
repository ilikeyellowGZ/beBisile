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
import { publicRoutes } from './routes/public.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export const app = express();
const clientDistPath = [
  path.resolve(process.cwd(), '..', 'dist'),
  path.resolve(process.cwd(), 'dist'),
].find((candidate) => fs.existsSync(path.join(candidate, 'index.html')));

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checkout', checkoutRoutes);
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
