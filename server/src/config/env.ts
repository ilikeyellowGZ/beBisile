import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().default('bisile'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  TEMP_NETLIFY_URL: z.string().url().or(z.literal('')).optional(),
  CLIENT_URL: z.string().url().or(z.literal('')).optional(),
  SERVER_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().default(''),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  CLIENT_URL: parsedEnv.CLIENT_URL || parsedEnv.FRONTEND_URL,
};

const isString = (value: string | undefined): value is string => Boolean(value);

export const corsOrigins = Array.from(new Set([
  env.FRONTEND_URL,
  env.CLIENT_URL,
  env.TEMP_NETLIFY_URL,
  ...env.CORS_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean),
].filter(isString)));
