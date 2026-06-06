import type { NextFunction, Response } from 'express';
import type { AdminRole, AuthedRequest } from './auth.middleware.js';

export const requireRole = (...roles: AdminRole[]) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!req.admin || !roles.includes(req.admin.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

export const requirePricePermission = requireRole('owner');
export const requireRefundPermission = requireRole('owner');
export const requireAdminManagement = requireRole('owner');
