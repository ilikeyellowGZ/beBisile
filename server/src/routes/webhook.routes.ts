import { Router } from 'express';
import { markPaystackOrderPaid, verifyPaystackSignature } from '../services/paystack.service.js';

export const webhookRoutes = Router();

webhookRoutes.post('/paystack', async (req, res) => {
  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  if (!verifyPaystackSignature(body, req.headers['x-paystack-signature'])) return res.status(401).send('Invalid Paystack signature');

  const event = JSON.parse(body.toString('utf8') || '{}');
  if (event.event === 'charge.success') await markPaystackOrderPaid(event.data);
  res.json({ received: true });
});
