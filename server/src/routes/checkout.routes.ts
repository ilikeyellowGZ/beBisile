import { Router } from 'express';
import { rejectPriceFields, validate } from '../middleware/validate.middleware.js';
import { calculateTrustedOrder, checkoutSchema, createPendingOrder } from '../services/order.service.js';
import { createPaystackTransaction, verifyPaystackTransaction } from '../services/paystack.service.js';

export const checkoutRoutes = Router();

const initializePaystackCheckout = async (req: any, res: any) => {
  const calculated = await calculateTrustedOrder(req.body);
  const order = await createPendingOrder(req.body, calculated);
  const transaction = await createPaystackTransaction(order);
  res.json({
    url: transaction.authorization_url,
    authorizationUrl: transaction.authorization_url,
    accessCode: transaction.access_code,
    reference: transaction.reference,
    orderNumber: order.orderNumber,
    orderId: order._id
  });
};

checkoutRoutes.post('/create-paystack-transaction', rejectPriceFields, validate(checkoutSchema), initializePaystackCheckout);
checkoutRoutes.post('/create-session', rejectPriceFields, validate(checkoutSchema), initializePaystackCheckout);
checkoutRoutes.post('/verify-paystack-transaction', async (req, res) => {
  const reference = String(req.body?.reference || '').trim();
  if (!reference) return res.status(400).json({ error: 'Paystack reference is required' });
  const { transaction, order } = await verifyPaystackTransaction(reference);
  res.json({ status: transaction.status, reference, orderNumber: order?.orderNumber || transaction.metadata?.orderNumber || null });
});
