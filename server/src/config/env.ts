import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const loadEnvFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
};

loadEnvFile(path.resolve(process.cwd(), '.env'));
loadEnvFile(path.resolve(process.cwd(), '..', '.env'));

const defaultFrontendUrl = process.env.NODE_ENV === 'production' ? 'https://bisile.co.za' : 'http://localhost:5173';
const defaultCorsOrigins = [
  'https://bisile.co.za',
  'https://www.bisile.co.za',
  ...(process.env.NODE_ENV === 'production' ? [] : [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]),
];

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().optional(),
  MONGODB_DB_NAME: z.string().optional(),
  MONGODB_DATABASE: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  BACKEND_WAKE_TOKEN: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default(defaultFrontendUrl),
  CLIENT_URL: z.string().url().or(z.literal('')).optional(),
  SERVER_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().default(''),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  MONGODB_DB: parsedEnv.MONGODB_DB_NAME || parsedEnv.MONGODB_DB || parsedEnv.MONGODB_DATABASE || 'bisile',
  CLIENT_URL: parsedEnv.CLIENT_URL || parsedEnv.FRONTEND_URL,
};

const isString = (value: string | undefined): value is string => Boolean(value);

export const corsOrigins = Array.from(new Set([
  ...defaultCorsOrigins,
  env.FRONTEND_URL,
  env.CLIENT_URL,
  ...env.CORS_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean),
].filter(isString)));
