import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { paystackApiBase, paystackSecretKey } from '../config/paystack.js';
import { DiscountCode, Order, Payment } from '../models/index.js';
import { reduceStockForOrder } from './inventory.service.js';

type PaystackTransaction = {
  id?: number | string;
  reference?: string;
  status?: string;
  amount?: number;
  currency?: string;
  channel?: string;
  paid_at?: string;
  receipt_url?: string;
  metadata?: { orderNumber?: string; orderId?: string; customerName?: string; shippingPartner?: string };
};

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

const toPaystackSubunit = (amount: number) => Math.round(Number(amount || 0) * 100);
const makeReference = (orderNumber: string) => `${orderNumber}-${Date.now()}`.replace(/[^A-Za-z0-9-.=]/g, '-');

const paystackRequest = async <T>(path: string, init: RequestInit = {}) => {
  const response = await fetch(`${paystackApiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({})) as Partial<PaystackResponse<T>>;
  if (!response.ok || payload.status === false) {
    throw Object.assign(new Error(payload.message || 'Paystack request failed'), { statusCode: response.status || 502 });
  }

  return payload as PaystackResponse<T>;
};

export const createPaystackTransaction = async (order: InstanceType<typeof Order>) => {
  const reference = makeReference(order.orderNumber);
  const callbackUrl = `${env.CLIENT_URL}/#/order-complete?order=${encodeURIComponent(order.orderNumber)}&reference=${encodeURIComponent(reference)}`;
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

  const order = await Order.findOne({ paystackReference: transaction.reference });
  if (!order) return null;
  if (order.paymentStatus === 'paid') return order;

  const paidAmount = Number(transaction.amount || 0) / 100;
  if (Math.abs(paidAmount - Number(order.totalAmount || 0)) > 0.01) {
    throw Object.assign(new Error('Verified Paystack amount does not match order total'), { statusCode: 400 });
  }

  const currency = String(transaction.currency || order.currency || 'ZAR').toUpperCase();
  if (currency !== String(order.currency || 'ZAR').toUpperCase()) {
    throw Object.assign(new Error('Verified Paystack currency does not match order currency'), { statusCode: 400 });
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'paid';
  order.paystackTransactionId = transaction.id == null ? undefined : String(transaction.id);
  order.paystackPaidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();
  order.paidAt = order.paystackPaidAt;
  await order.save();

  await Payment.create({
    orderId: order._id,
    customerId: order.customerId,
    paystackReference: transaction.reference,
    paystackTransactionId: transaction.id == null ? undefined : String(transaction.id),
    amount: paidAmount,
    currency,
    status: 'paid',
    paymentMethod: `paystack_${transaction.channel || 'checkout'}`,
    receiptUrl: transaction.receipt_url
  });

  await reduceStockForOrder(order);
  if (order.discountCode) await DiscountCode.updateOne({ code: order.discountCode }, { $inc: { usedCount: 1 } });

  return order;
};
