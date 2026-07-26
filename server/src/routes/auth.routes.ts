import bcrypt from 'bcrypt';
import { Router, type Request } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Admin } from '../models/index.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { writeAuditLog } from '../services/audit.service.js';
import { asyncHandler } from '../middleware/async-handler.js';

export const authRoutes = Router();
const LOGOUT_AUDIT_GRACE_SECONDS = 5 * 60;

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1)
}).strict();

const getLogoutAdminId = async (req: Request) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.adminToken;
  if (!token) return null;

  try {
    // The token signature is still verified, but expiry is ignored so a timeout
    // can be audited even when the 30-minute session has just ended.
    const claims = jwt.verify(token, env.JWT_SECRET, { ignoreExpiration: true }) as { sub?: string; exp?: number };
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!claims.sub || typeof claims.exp !== 'number' || claims.exp < nowSeconds - LOGOUT_AUDIT_GRACE_SECONDS) return null;
    const admin = await Admin.findById(claims.sub).select('_id').lean();
    return admin ? String(admin._id) : null;
  } catch {
    return null;
  }
};

authRoutes.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  if (typeof req.body.password !== 'string') return res.status(400).json({ error: 'Password must be a string' });
  const identifier = req.body.username.toLowerCase().trim();
  const admin = await Admin.findOne({
    isActive: true,
    username: identifier,
  });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.passwordHash))) return res.status(401).json({ error: 'Invalid login' });
  admin.lastLoginAt = new Date();
  await admin.save();
  await writeAuditLog(req, { adminId: String(admin._id), action: 'admin_login', entityType: 'admin', entityId: admin._id });
  const token = jwt.sign({ sub: String(admin._id), email: admin.email, role: admin.role }, env.JWT_SECRET, { expiresIn: '30m' });
  res.json({ token, admin: { id: admin._id, fullName: admin.fullName, username: admin.username, email: admin.email, role: admin.role, mustChangePassword: Boolean(admin.mustChangePassword) } });
}));

authRoutes.post('/logout', asyncHandler(async (req, res) => {
  const adminId = await getLogoutAdminId(req);
  let auditRecorded = false;
  if (adminId) {
    try {
      await writeAuditLog(req, { adminId, action: 'admin_logout', entityType: 'admin', entityId: adminId });
      auditRecorded = true;
    } catch (error) {
      console.error('Admin logout audit could not be written; logout will still succeed.', {
        adminId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  res.json({ ok: true, auditRecorded });
}));

authRoutes.get('/me', requireAuth, (req: AuthedRequest, res) => res.json({ admin: req.admin }));

authRoutes.post('/change-password', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  if (typeof req.body?.password !== 'string') return res.status(400).json({ error: 'Password must be a string' });
  const password = req.body.password;
  if (password.length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
  await Admin.findByIdAndUpdate(req.admin!.id, { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: false });
  res.json({ ok: true });
}));
