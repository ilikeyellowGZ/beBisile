import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface WakeRequest extends Request {
  wakeClaims?: { sub?: string; scope?: string; aud?: string };
}

export const requireWakeJwt = (req: WakeRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const claims = jwt.verify(token, env.JWT_SECRET) as { sub?: string; scope?: string; aud?: string };
    if (claims.scope !== 'wake' || claims.aud !== 'bisile-frontend') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    req.wakeClaims = claims;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
