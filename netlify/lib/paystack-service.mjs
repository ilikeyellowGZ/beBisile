import { createHmac, timingSafeEqual } from 'node:crypto';
import { collectionNames, now } from './secure-db.mjs';
import { reduceStockForOrder } from './commerce-service.mjs';

const PAYSTACK_API_BASE = 'https://api.paystack.co';

export const paystackSecretKey = () => process.env.PAYSTACK_SECRET_KEY || '';

const requirePaystackSecret = () => {
  const secret = paystackSecretKey();
  if (!secret) {
    const error = new Error('Paystack is not configured');
    error.statusCode = 500;
    throw error;
  }
  return secret;
};

export const toPaystackSubunit = (amount) => Math.round(Number(amount || 0) * 100);

export const paystackRequest = async (path, options = {}) => {
  const response = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${requirePaystackSecret()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === false) {
    const error = new Error(payload.message || 'Paystack request failed');
    error.statusCode = response.status || 502;
    throw error;
  }
  return payload;
};

export const verifyPaystackSignature = (bodyBuffer, signature) => {
  if (!signature) return false;
  const expected = createHmac('sha512', requirePaystackSecret()).update(bodyBuffer).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(String(signature), 'hex');
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
};

export const markPaystackOrderPaid = async (db, transaction) => {
  if (!transaction?.reference || transaction.status !== 'success') return null;

  const order = await db.collection(collectionNames.orders).findOne({ paystackReference: transaction.reference });
  if (!order) return null;
  if (order.paymentStatus === 'paid') return order;

  const paidAmount = Number(transaction.amount || 0) / 100;
  const expectedAmount = Number(order.totalAmount || 0);
  if (Math.abs(paidAmount - expectedAmount) > 0.01) {
    const error = new Error('Verified Paystack amount does not match order total');
    error.statusCode = 400;
    throw error;
  }

  const currency = String(transaction.currency || order.currency || 'ZAR').toUpperCase();
  if (currency !== String(order.currency || 'ZAR').toUpperCase()) {
    const error = new Error('Verified Paystack currency does not match order currency');
    error.statusCode = 400;
    throw error;
  }

  const paidOrder = {
    ...order,
    paymentStatus: 'paid',
    orderStatus: 'paid',
    paystackTransactionId: transaction.id,
    paystackPaidAt: transaction.paid_at ? new Date(transaction.paid_at) : now(),
    paidAt: transaction.paid_at ? new Date(transaction.paid_at) : now(),
    updatedAt: now(),
  };

  await db.collection(collectionNames.orders).updateOne(
    { _id: order._id },
    {
      $set: {
        paymentStatus: paidOrder.paymentStatus,
        orderStatus: paidOrder.orderStatus,
        paystackTransactionId: paidOrder.paystackTransactionId,
        paystackPaidAt: paidOrder.paystackPaidAt,
        paidAt: paidOrder.paidAt,
        updatedAt: paidOrder.updatedAt,
      },
    }
  );

  await db.collection(collectionNames.payments).updateOne(
    { paystackReference: transaction.reference },
    {
      $setOnInsert: {
        orderId: order._id,
        customerId: order.customerId || null,
        paystackReference: transaction.reference,
        paystackTransactionId: transaction.id,
        amount: paidAmount,
        currency,
        status: 'paid',
        paymentMethod: `paystack_${transaction.channel || 'checkout'}`,
        receiptUrl: transaction.receipt_url || null,
        refundedAmount: 0,
        createdAt: now(),
        updatedAt: now(),
      },
    },
    { upsert: true }
  );

  await reduceStockForOrder(db, paidOrder);

  if (order.discountCode) {
    await db.collection(collectionNames.discountCodes).updateOne(
      { code: order.discountCode },
      { $inc: { usedCount: 1 }, $set: { updatedAt: now() } }
    );
  }

  return paidOrder;
};
