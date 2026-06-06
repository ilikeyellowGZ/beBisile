import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Validation failed', issues: result.error.flatten() });
  req.body = result.data;
  next();
};

export const rejectPriceFields = (req: Request, res: Response, next: NextFunction) => {
  const forbidden = new Set(['price', 'unitPrice', 'total', 'subtotal', 'discountAmount', 'totalAmount', 'finalAmount', 'amount']);
  const walk = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (forbidden.has(key)) return key;
      const found = walk(child);
      if (found) return found;
    }
    return null;
  };
  const field = walk(req.body);
  if (field) return res.status(400).json({ error: `Frontend price field "${field}" is not allowed` });
  next();
};
