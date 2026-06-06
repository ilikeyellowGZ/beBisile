import { Router } from 'express';
import { env } from '../config/env.js';
import { stripe } from '../config/stripe.js';
import { handleStripeEvent } from '../services/stripe.service.js';

export const webhookRoutes = Router();

webhookRoutes.post('/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) return res.status(400).send('Missing Stripe signature');
  const event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  await handleStripeEvent(event);
  res.json({ received: true });
});
