import Stripe from 'stripe';
import { collectionNames, getDb, json, now } from '../lib/secure-db.mjs';
import { reduceStockForOrder } from '../lib/commerce-service.mjs';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const rawBody = (event) => event.isBase64Encoded
  ? Buffer.from(event.body || '', 'base64')
  : Buffer.from(event.body || '', 'utf8');

const markOrderPaid = async (db, session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await db.collection(collectionNames.orders).findOne({ stripeCheckoutSessionId: session.id });
  if (!order || order.paymentStatus === 'paid') return;

  await db.collection(collectionNames.orders).updateOne(
    { _id: order._id },
    {
      $set: {
        paymentStatus: 'paid',
        orderStatus: 'paid',
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
        paidAt: now(),
        updatedAt: now(),
      },
    }
  );

  await db.collection(collectionNames.payments).updateOne(
    { stripeCheckoutSessionId: session.id },
    {
      $setOnInsert: {
        orderId: order._id,
        customerId: order.customerId || null,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
        amount: Number(session.amount_total || Math.round(order.totalAmount * 100)) / 100,
        currency: (session.currency || order.currency || 'zar').toUpperCase(),
        status: 'paid',
        paymentMethod: 'stripe_checkout',
        receiptUrl: null,
        refundedAmount: 0,
        createdAt: now(),
        updatedAt: now(),
      },
    },
    { upsert: true }
  );

  await reduceStockForOrder(db, order);

  if (order.discountCode) {
    await db.collection(collectionNames.discountCodes).updateOne(
      { code: order.discountCode },
      { $inc: { usedCount: 1 }, $set: { updatedAt: now() } }
    );
  }
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  if (!stripe) return json(500, { error: 'Stripe is not configured' });

  try {
    const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return json(500, { error: 'Stripe webhook secret is not configured' });
    if (!signature) return json(400, { error: 'Missing Stripe signature' });

    const stripeEvent = stripe.webhooks.constructEvent(rawBody(event), signature, webhookSecret);

    const db = await getDb();

    if (stripeEvent.type === 'checkout.session.completed') {
      await markOrderPaid(db, stripeEvent.data.object);
    }

    if (stripeEvent.type === 'payment_intent.payment_failed') {
      const intent = stripeEvent.data.object;
      await db.collection(collectionNames.orders).updateOne(
        { stripePaymentIntentId: intent.id },
        { $set: { paymentStatus: 'failed', updatedAt: now() } }
      );
    }

    if (['charge.refunded', 'refund.created', 'refund.updated'].includes(stripeEvent.type)) {
      const refundObject = stripeEvent.data.object;
      await db.collection(collectionNames.refunds).updateOne(
        { stripeRefundId: refundObject.id },
        {
          $set: {
            stripeRefundId: refundObject.id,
            amount: Number(refundObject.amount || 0) / 100,
            reason: refundObject.reason || refundObject.metadata?.reason || '',
            status: refundObject.status || 'refunded',
            updatedAt: now(),
          },
          $setOnInsert: { createdAt: now() },
        },
        { upsert: true }
      );
    }

    return json(200, { received: true });
  } catch (error) {
    return json(400, { error: error.message || 'Webhook failed' });
  }
};
