import Stripe from 'stripe';
import { resolveItems } from '../lib/catalog.mjs';
import { getDatabase } from '../lib/mongo.mjs';
import { json } from '../lib/response.mjs';

const validateCustomer = (customer) => {
  if (!customer || typeof customer !== 'object') throw new Error('Delivery details are required.');
  for (const field of ['fullName', 'email', 'phone', 'address', 'city', 'postalCode']) {
    if (typeof customer[field] !== 'string' || !customer[field].trim()) throw new Error('Please complete your delivery details.');
  }
  return customer;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe checkout is not configured yet.');
    const { customer: rawCustomer, items: rawItems } = JSON.parse(event.body || '{}');
    const customer = validateCustomer(rawCustomer);
    const items = resolveItems(rawItems);
    const currency = (process.env.STRIPE_CURRENCY || 'zar').toLowerCase();
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const db = await getDatabase();
    const order = await db.collection('orders').insertOne({ customer, items, total, currency, paymentStatus: 'pending', createdAt: new Date(), updatedAt: new Date() });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = process.env.SITE_URL || process.env.URL || 'http://localhost:8888';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      line_items: items.map((item) => ({ quantity: item.quantity, price_data: { currency, unit_amount: Math.round(item.unitPrice * 100), product_data: { name: item.name } } })),
      success_url: `${origin}/#/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/payment`,
      metadata: { orderId: order.insertedId.toString() },
    });
    await db.collection('orders').updateOne({ _id: order.insertedId }, { $set: { stripeCheckoutSessionId: session.id, updatedAt: new Date() } });
    return json(200, { url: session.url });
  } catch (error) {
    console.error(error);
    return json(400, { error: error instanceof Error ? error.message : 'Unable to start checkout.' });
  }
};
