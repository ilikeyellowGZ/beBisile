import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Admin } from '../models/index.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { writeAuditLog } from '../services/audit.service.js';
import { asyncHandler } from '../middleware/async-handler.js';

export const authRoutes = Router();

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1)
}).strict();

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
  const token = jwt.sign({ sub: String(admin._id), email: admin.email, role: admin.role }, env.JWT_SECRET, { expiresIn: '15m' });
  res.json({ token, admin: { id: admin._id, fullName: admin.fullName, username: admin.username, email: admin.email, role: admin.role, mustChangePassword: Boolean(admin.mustChangePassword) } });
}));

authRoutes.post('/logout', (_req, res) => res.json({ ok: true }));

authRoutes.get('/me', requireAuth, (req: AuthedRequest, res) => res.json({ admin: req.admin }));

authRoutes.post('/change-password', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  if (typeof req.body?.password !== 'string') return res.status(400).json({ error: 'Password must be a string' });
  const password = req.body.password;
  if (password.length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
  await Admin.findByIdAndUpdate(req.admin!.id, { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: false });
  res.json({ ok: true });
}));
