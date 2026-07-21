import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { app } from './app.js';

const server = app.listen(env.PORT, () => {
  console.log(`BISILE secure API listening on ${env.PORT}`);
});

const connectWithRetry = async () => {
  while (true) {
    try {
      await connectDb();
      console.log(`BISILE MongoDB connected to database "${env.MONGODB_DB}"`);
      return;
    } catch (error) {
      console.error('BISILE MongoDB connection failed; API remains online but readiness is degraded.', {
        error: error instanceof Error ? error.message : error,
      });
      await new Promise((resolve) => setTimeout(resolve, 10_000));
    }
  }
};

void connectWithRetry();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', { reason });
});

process.on('SIGTERM', () => {
  server.close(() => {
    void import('mongoose').then(({ default: mongoose }) => mongoose.disconnect()).finally(() => process.exit(0));
  });
});
