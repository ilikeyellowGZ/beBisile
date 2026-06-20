import fs from 'node:fs';
import path from 'node:path';

export const loadEnv = (filePath = path.resolve(process.cwd(), '.env')) => {
  if (!fs.existsSync(filePath)) return {};

  const loaded = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
    loaded[key] = process.env[key];
  }
  return loaded;
};

export const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const getDatabaseName = () => process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || process.env.MONGODB_DATABASE || 'bisile';
