import { MongoClient, ObjectId } from 'mongodb';

let cachedClient;

export const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers,
  },
  body: JSON.stringify(body),
});

export const getDb = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  return cachedClient.db(process.env.MONGODB_DB || process.env.MONGO_DB || 'bisile');
};

export const toObjectId = (value) => {
  if (!value || !ObjectId.isValid(value)) return null;
  return new ObjectId(value);
};

export const now = () => new Date();

export const getRequestMeta = (event) => ({
  ipAddress: event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || event.headers?.['client-ip'] || 'unknown',
  userAgent: event.headers?.['user-agent'] || 'unknown',
});

export const normalizeMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

export const collectionNames = {
  admins: 'admins',
  products: 'products',
  categories: 'categories',
  customers: 'customers',
  carts: 'carts',
  orders: 'orders',
  payments: 'payments',
  refunds: 'refunds',
  contactMessages: 'contactMessages',
  newsletterSubscribers: 'newsletterSubscribers',
  reviews: 'reviews',
  discountCodes: 'discountCodes',
  inventoryLogs: 'inventoryLogs',
  auditLogs: 'auditLogs',
  storeSettings: 'storeSettings',
};
