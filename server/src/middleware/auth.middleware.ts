import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/index.js';

export type AdminRole = 'owner' | 'manager' | 'support';

export interface AuthedRequest extends Request {
  admin?: { id: string; email: string; role: AdminRole };
}

export const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const claims = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string; role: AdminRole };
    const admin = await Admin.findById(claims.sub).lean();
    if (!admin || admin.isActive === false) return res.status(401).json({ error: 'Unauthorized' });
    req.admin = { id: String(admin._id), email: admin.email, role: admin.role as AdminRole };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
