import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Admin } from '../models/index.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { writeAuditLog } from '../services/audit.service.js';

export const authRoutes = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();

authRoutes.post('/login', validate(loginSchema), async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email.toLowerCase(), isActive: true });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.passwordHash))) return res.status(401).json({ error: 'Invalid login' });
  admin.lastLoginAt = new Date();
  await admin.save();
  await writeAuditLog(req, { adminId: String(admin._id), action: 'admin_login', entityType: 'admin', entityId: admin._id });
  const token = jwt.sign({ sub: String(admin._id), email: admin.email, role: admin.role }, env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, admin: { id: admin._id, fullName: admin.fullName, email: admin.email, role: admin.role } });
});

authRoutes.post('/logout', (_req, res) => res.json({ ok: true }));

authRoutes.get('/me', requireAuth, (req: AuthedRequest, res) => res.json({ admin: req.admin }));

authRoutes.post('/change-password', requireAuth, async (req: AuthedRequest, res) => {
  const password = String(req.body.password || '');
  if (password.length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
  await Admin.findByIdAndUpdate(req.admin!.id, { passwordHash: await bcrypt.hash(password, 12) });
  res.json({ ok: true });
});
