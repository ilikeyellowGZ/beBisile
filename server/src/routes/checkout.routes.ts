import { Router } from 'express';
import { rejectPriceFields, validate } from '../middleware/validate.middleware.js';
import { calculateTrustedOrder, checkoutSchema, createPendingOrder } from '../services/order.service.js';
import { createPaystackTransaction, verifyPaystackTransaction } from '../services/paystack.service.js';
import { asyncHandler } from '../middleware/async-handler.js';

export const checkoutRoutes = Router();

const initializePaystackCheckout = async (req: any, res: any, next: any) => {
  try {
    const calculated = await calculateTrustedOrder(req.body);
    const order = await createPendingOrder(req.body, calculated, req.get('Idempotency-Key'));
    const transaction = await createPaystackTransaction(order);
    res.json({
      success: true,
      url: transaction.authorization_url,
      authorization_url: transaction.authorization_url,
      authorizationUrl: transaction.authorization_url,
      access_code: transaction.access_code,
      accessCode: transaction.access_code,
      reference: transaction.reference,
      orderNumber: order.orderNumber,
      orderId: order._id
    });
  } catch (error) {
    next(error);
  }
};

checkoutRoutes.post('/create-paystack-transaction', rejectPriceFields, validate(checkoutSchema), asyncHandler(initializePaystackCheckout));
checkoutRoutes.post('/create-session', rejectPriceFields, validate(checkoutSchema), asyncHandler(initializePaystackCheckout));
checkoutRoutes.post('/verify-paystack-transaction', asyncHandler(async (req, res, next) => {
  try {
    const reference = String(req.body?.reference || '').trim();
    if (!reference) return res.status(400).json({ success: false, message: 'Paystack reference is required', error: 'Paystack reference is required' });
    const { transaction, order } = await verifyPaystackTransaction(reference);
    if (transaction.status === 'success' && !order) {
      return res.status(404).json({
        success: false,
        status: transaction.status,
        reference,
        message: 'Verified payment succeeded, but the matching BISILE order was not found.',
      });
    }

    res.json({
      success: true,
      status: transaction.status,
      reference,
      orderNumber: order?.orderNumber || transaction.metadata?.orderNumber || null,
      customerName: order?.customerInfo?.fullName || transaction.metadata?.customerName || null,
      orderTotal: order?.totalAmount || null,
      currency: order?.currency || transaction.currency || 'ZAR',
      shippingOption: order?.shippingPartner?.name || order?.shippingPartner?.id || transaction.metadata?.shippingPartner || null,
      paymentStatus: order?.paymentStatus || transaction.status,
    });
  } catch (error) {
    next(error);
  }
}));
