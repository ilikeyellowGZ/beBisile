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
    if (!token) {
      console.warn('JWT auth failed: missing bearer token', { path: req.path, method: req.method });
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const claims = jwt.verify(token, env.JWT_SECRET) as { sub?: string; scope?: string; aud?: string };
    if (claims.scope !== 'wake' || claims.aud !== 'bisile-frontend') {
      console.warn('JWT auth failed: forbidden claims', { path: req.path, method: req.method, scope: claims.scope, aud: claims.aud });
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    req.wakeClaims = claims;
    next();
  } catch (error) {
    console.warn('JWT auth failed: invalid token', { path: req.path, method: req.method, error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
