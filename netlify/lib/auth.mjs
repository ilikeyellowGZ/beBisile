import { pbkdf2Sync, randomBytes, createHash, timingSafeEqual } from 'node:crypto';

const PASSWORD_ITERATIONS = 310000;
const SESSION_HOURS = 12;

export const parseJsonBody = (event) => {
  if (!event.body) return {};
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  return JSON.parse(rawBody);
};

export const normalizeUsername = (username) => String(username || '').trim().toLowerCase();

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(String(password), salt, PASSWORD_ITERATIONS, 32, 'sha256').toString('hex');
  return { salt, hash, iterations: PASSWORD_ITERATIONS };
};

export const verifyPassword = (password, user) => {
  const salt = user?.passwordSalt || user?.salt;
  if (!password || !salt || !user?.passwordHash) return false;
  const iterations = Number(user.passwordIterations || PASSWORD_ITERATIONS);
  const attempted = pbkdf2Sync(String(password), salt, iterations, 32, 'sha256');
  const stored = Buffer.from(user.passwordHash, 'hex');
  return stored.length === attempted.length && timingSafeEqual(stored, attempted);
};

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export const createAdminSession = async (db, userId) => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await db.collection('adminSessions').insertOne({
    tokenHash: hashToken(token),
    userId,
    createdAt: new Date(),
    expiresAt,
  });
  return { token, expiresAt };
};

export const validateAdminSession = async (event, db) => {
  const token = String(event.headers.authorization || event.headers.Authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const session = await db.collection('adminSessions').findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  return db.collection('adminUsers').findOne({ _id: session.userId, active: { $ne: false } });
};
