import crypto from 'crypto';
import { collectionNames, getDb, getRequestMeta, now } from './secure-db.mjs';

const tokenSecret = () => process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || process.env.STRIPE_WEBHOOK_SECRET || 'development-only-change-me';
const passwordSecret = () => process.env.ADMIN_PASSWORD_SECRET || tokenSecret();

const base64url = (input) => Buffer.from(input).toString('base64url');

export const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(`${password}:${passwordSecret()}`, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
};

export const verifyPassword = (password, passwordHash) => {
  if (!passwordHash?.startsWith('scrypt:')) return false;
  const [, salt, expected] = passwordHash.split(':');
  const actual = hashPassword(password, salt).split(':')[2];
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
};

export const signAdminToken = (admin) => {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: String(admin._id),
    email: admin.email,
    role: admin.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
  }));
  const signature = crypto.createHmac('sha256', tokenSecret()).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
};

export const verifyAdminToken = (token) => {
  if (!token) return null;
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const expected = crypto.createHmac('sha256', tokenSecret()).update(`${header}.${payload}`).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
  return decoded;
};

export const getBearerToken = (event) => {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice('Bearer '.length).trim();
};

export const requireAdmin = async (event, allowedRoles = ['owner', 'manager', 'support']) => {
  const claims = verifyAdminToken(getBearerToken(event));
  if (!claims) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  const db = await getDb();
  const admin = await db.collection(collectionNames.admins).findOne({ email: claims.email, isActive: { $ne: false } });
  if (!admin || !allowedRoles.includes(admin.role)) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return admin;
};

export const canChangePrices = (admin) => ['owner'].includes(admin.role);
export const canManageAdmins = (admin) => ['owner'].includes(admin.role);
export const canRefund = (admin) => ['owner'].includes(admin.role);

export const writeAuditLog = async (event, admin, action, entityType, entityId, oldValue, newValue) => {
  const db = await getDb();
  await db.collection(collectionNames.auditLogs).insertOne({
    adminId: admin?._id ?? null,
    action,
    entityType,
    entityId,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    ...getRequestMeta(event),
    createdAt: now(),
  });
};
