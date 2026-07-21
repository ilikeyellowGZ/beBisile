import { createHmac, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { paystackApiBase, paystackSecretKey } from '../config/paystack.js';
import { DiscountCode, InventoryLog, Order, Payment, Product } from '../models/index.js';
import { sendAdminOrderNotificationEmail, sendOrderConfirmationEmail } from './email.service.js';

type PaystackTransaction = {
  id?: number | string;
  reference?: string;
  status?: string;
  amount?: number;
  currency?: string;
  channel?: string;
  paid_at?: string;
  receipt_url?: string;
  domain?: string;
  customer?: { email?: string };
  metadata?: { orderNumber?: string; orderId?: string; customerName?: string; shippingPartner?: string };
};

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

const toPaystackSubunit = (amount: number) => Math.round(Number(amount || 0) * 100);
const makeReference = (orderNumber: string) => `${orderNumber}-${Date.now()}`.replace(/[^A-Za-z0-9-.=]/g, '-');

export const paystackRequest = async <T>(path: string, init: RequestInit = {}) => {
  console.info('Paystack request', { path, method: init.method || 'GET' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  let response: Response;
  try {
    response = await fetch(`${paystackApiBase}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
        ...(init.headers || {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => ({})) as Partial<PaystackResponse<T>>;
  console.info('Paystack response', {
    path,
    statusCode: response.status,
    paystackStatus: payload.status,
    message: payload.message,
  });

  if (!response.ok || payload.status === false) {
    throw Object.assign(new Error(payload.message || 'Paystack request failed'), { statusCode: response.status || 502 });
  }

  return payload as PaystackResponse<T>;
};

export const createPaystackTransaction = async (order: InstanceType<typeof Order>) => {
  if (order.paystackReference && order.paystackAuthorizationUrl) {
    return {
      authorization_url: order.paystackAuthorizationUrl,
      access_code: order.paystackAccessCode,
      reference: order.paystackReference,
    };
  }

  const reference = makeReference(order.orderNumber);
  const callbackUrl = `${env.CLIENT_URL}/order-complete?order=${encodeURIComponent(order.orderNumber)}&reference=${encodeURIComponent(reference)}`;
  const payload = await paystackRequest<{ authorization_url: string; access_code: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: order.customerInfo?.email,
      amount: String(toPaystackSubunit(Number(order.totalAmount || 0))),
      currency: order.currency || 'ZAR',
      reference,
      callback_url: callbackUrl,
      metadata: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        customerName: order.customerInfo?.fullName,
        shippingPartner: order.shippingPartner?.name || order.shippingPartner?.id
      }
    })
  });

  order.paystackReference = payload.data.reference || reference;
  order.paystackAccessCode = payload.data.access_code;
  order.paystackAuthorizationUrl = payload.data.authorization_url;
  await order.save();
  console.info('Paystack checkout initialized', {
    orderNumber: order.orderNumber,
    reference: order.paystackReference,
    hasAuthorizationUrl: Boolean(order.paystackAuthorizationUrl),
    callbackUrl,
  });
  return payload.data;
};

export const verifyPaystackTransaction = async (reference: string) => {
  const payload = await paystackRequest<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`, { method: 'GET' });
  const order = await markPaystackOrderPaid(payload.data);
  return { transaction: payload.data, order };
};

export const verifyPaystackSignature = (body: Buffer, signature: string | string[] | undefined) => {
  if (!signature || Array.isArray(signature)) return false;
  const expected = createHmac('sha512', paystackSecretKey).update(body).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
};

export const markPaystackOrderPaid = async (transaction: PaystackTransaction) => {
  if (!transaction.reference || transaction.status !== 'success') return null;

  const session = await mongoose.startSession();
  let fulfilledOrder: any = null;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ paystackReference: transaction.reference }).session(session);
      if (!order) return;

      const paidAmount = Number(transaction.amount || 0) / 100;
      if (Math.abs(paidAmount - Number(order.totalAmount || 0)) > 0.01) {
        throw Object.assign(new Error('Verified Paystack amount does not match order total'), { statusCode: 400 });
      }

      const currency = String(transaction.currency || order.currency || 'ZAR').toUpperCase();
      if (currency !== String(order.currency || 'ZAR').toUpperCase()) {
        throw Object.assign(new Error('Verified Paystack currency does not match order currency'), { statusCode: 400 });
      }
      if (env.NODE_ENV === 'production' && transaction.domain && transaction.domain !== 'live') {
        throw Object.assign(new Error('A test-mode Paystack transaction cannot settle a production order'), { statusCode: 400 });
      }
      if (transaction.metadata?.orderNumber && transaction.metadata.orderNumber !== order.orderNumber) {
        throw Object.assign(new Error('Paystack order metadata does not match the BISILE order'), { statusCode: 400 });
      }
      if (transaction.metadata?.orderId && transaction.metadata.orderId !== String(order._id)) {
        throw Object.assign(new Error('Paystack order ID metadata does not match the BISILE order'), { statusCode: 400 });
      }
      if (transaction.customer?.email && transaction.customer.email.toLowerCase() !== String(order.customerInfo?.email || '').toLowerCase()) {
        throw Object.assign(new Error('Paystack customer email does not match the BISILE order'), { statusCode: 400 });
      }

      if (['paid', 'partially_refunded', 'refunded'].includes(String(order.paymentStatus))) {
        fulfilledOrder = order;
        return;
      }

      for (const item of order.items) {
        if (!item.productId) continue;
        const quantity = Number(item.quantity || 0);
        if (quantity < 1) continue;
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );
        if (!product) {
          throw Object.assign(new Error(`Insufficient stock to settle paid order ${order.orderNumber}`), { statusCode: 409 });
        }
        await InventoryLog.create([{
          productId: product._id,
          previousStock: product.stock + quantity,
          newStock: product.stock,
          changeAmount: -quantity,
          reason: 'paid_order',
          orderId: order._id,
        }], { session });
      }

      const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();
      order.paymentStatus = 'paid';
      order.orderStatus = 'paid';
      order.paystackTransactionId = transaction.id == null ? undefined : String(transaction.id);
      order.paystackPaidAt = paidAt;
      order.paidAt = paidAt;
      await order.save({ session });

      await Payment.findOneAndUpdate(
        { paystackReference: transaction.reference },
        {
          $setOnInsert: {
            orderId: order._id,
            customerId: order.customerId,
            paystackReference: transaction.reference,
            paystackTransactionId: transaction.id == null ? undefined : String(transaction.id),
            amount: paidAmount,
            currency,
            status: 'paid',
            paymentMethod: `paystack_${transaction.channel || 'checkout'}`,
            receiptUrl: transaction.receipt_url,
          },
        },
        { upsert: true, new: true, session }
      );

      if (order.discountCode) {
        await DiscountCode.updateOne({ code: order.discountCode }, { $inc: { usedCount: 1 } }, { session });
      }

      void sendOrderConfirmationEmail({ order }).catch((error) => {
        console.error('Customer order email failed', { orderNumber: order.orderNumber, error: error instanceof Error ? error.message : error });
      });
      void sendAdminOrderNotificationEmail({ order }).catch((error) => {
        console.error('Admin order email failed', { orderNumber: order.orderNumber, error: error instanceof Error ? error.message : error });
      });
      fulfilledOrder = order;
    });
  } finally {
    await session.endSession();
  }

  return fulfilledOrder;
};
