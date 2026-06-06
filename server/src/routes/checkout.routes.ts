import { Router } from 'express';
import { rejectPriceFields, validate } from '../middleware/validate.middleware.js';
import { calculateTrustedOrder, checkoutSchema, createPendingOrder } from '../services/order.service.js';
import { createCheckoutSession } from '../services/stripe.service.js';

export const checkoutRoutes = Router();

checkoutRoutes.post('/create-session', rejectPriceFields, validate(checkoutSchema), async (req, res) => {
  const calculated = await calculateTrustedOrder(req.body);
  const order = await createPendingOrder(req.body, calculated);
  const session = await createCheckoutSession(order);
  res.json({ url: session.url, orderNumber: order.orderNumber, orderId: order._id });
});
