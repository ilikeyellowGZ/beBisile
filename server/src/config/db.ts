import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDb = async () => {
  mongoose.set('strictQuery', true);
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB,
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });
};
