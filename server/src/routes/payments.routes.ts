import { Router } from 'express';
import { rejectPriceFields, validate } from '../middleware/validate.middleware.js';
import { calculateTrustedOrder, checkoutSchema, createPendingOrder } from '../services/order.service.js';
import { createPaystackTransaction, verifyPaystackTransaction } from '../services/paystack.service.js';

export const paymentsRoutes = Router();

paymentsRoutes.post('/initialize', rejectPriceFields, validate(checkoutSchema), async (req, res, next) => {
  try {
    console.info('Payment initialization request', {
      itemCount: Array.isArray(req.body?.items) ? req.body.items.length : 0,
      emailPresent: Boolean(req.body?.customerInfo?.email),
      shippingPartner: req.body?.shippingPartner?.id || null,
      cartPayload: {
        items: req.body?.items,
        shippingPartner: req.body?.shippingPartner,
        discountCode: req.body?.discountCode || null,
      },
    });
    const calculated = await calculateTrustedOrder(req.body);
    const order = await createPendingOrder(req.body, calculated);
    const transaction = await createPaystackTransaction(order);
    console.info('Payment initialization completed', {
      orderNumber: order.orderNumber,
      reference: transaction.reference,
      hasAuthorizationUrl: Boolean(transaction.authorization_url),
    });
    res.json({
      success: true,
      authorization_url: transaction.authorization_url,
      authorizationUrl: transaction.authorization_url,
      url: transaction.authorization_url,
      access_code: transaction.access_code,
      accessCode: transaction.access_code,
      reference: transaction.reference,
      orderNumber: order.orderNumber,
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
});

paymentsRoutes.get('/verify/:reference', async (req, res, next) => {
  try {
    const reference = String(req.params.reference || '').trim();
    if (!reference) return res.status(400).json({ success: false, message: 'Paystack reference is required' });

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
});
