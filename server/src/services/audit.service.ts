import type { Request } from 'express';
import { AuditLog } from '../models/index.js';

export const writeAuditLog = async (req: Request, input: {
  adminId?: string;
  action: string;
  entityType: string;
  entityId?: unknown;
  oldValue?: unknown;
  newValue?: unknown;
}) => {
  await AuditLog.create({
    ...input,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || '',
    createdAt: new Date()
  });
};
