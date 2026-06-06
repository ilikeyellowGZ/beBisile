import type Stripe from 'stripe';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { DiscountCode, Order, Payment } from '../models/index.js';
import { reduceStockForOrder } from './inventory.service.js';

export const createCheckoutSession = async (order: InstanceType<typeof Order>) => {
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => {
    if (!item.stripePriceId) throw Object.assign(new Error('Order item is missing Stripe Price ID'), { statusCode: 400 });
    return {
      price: item.stripePriceId,
      quantity: Number(item.quantity ?? 1)
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: order.customerInfo?.email ?? undefined,
    line_items,
    metadata: { orderId: String(order._id), orderNumber: order.orderNumber },
    success_url: `${env.CLIENT_URL}/#/payment/success?order=${order.orderNumber}`,
    cancel_url: `${env.CLIENT_URL}/#/cart?cancelled=true`
  });

  order.stripeCheckoutSessionId = session.id;
  await order.save();
  return session;
};

export const handleStripeEvent = async (event: Stripe.Event) => {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = await Order.findOne({ stripeCheckoutSessionId: session.id });
    if (!order || order.paymentStatus === 'paid') return;

    order.paymentStatus = 'paid';
    order.orderStatus = 'paid';
    order.stripePaymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    order.paidAt = new Date();
    await order.save();

    await Payment.create({
      orderId: order._id,
      customerId: order.customerId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: order.stripePaymentIntentId,
      amount: (session.amount_total || Math.round(Number(order.totalAmount ?? 0) * 100)) / 100,
      currency: String(session.currency || order.currency || 'zar').toUpperCase(),
      status: 'paid',
      paymentMethod: 'stripe_checkout'
    });

    await reduceStockForOrder(order);
    if (order.discountCode) await DiscountCode.updateOne({ code: order.discountCode }, { $inc: { usedCount: 1 } });
  }
};
