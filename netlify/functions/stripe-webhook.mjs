import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../lib/mongo.mjs';
import { json } from '../lib/response.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) throw new Error('Stripe webhook is not configured.');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const signature = event.headers['stripe-signature'];
    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    const stripeEvent = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      if (session.metadata?.orderId) {
        const db = await getDatabase();
        await db.collection('orders').updateOne({ _id: new ObjectId(session.metadata.orderId) }, { $set: { paymentStatus: 'paid', stripePaymentStatus: session.payment_status, updatedAt: new Date() } });
      }
    }
    return json(200, { received: true });
  } catch (error) {
    console.error(error);
    return json(400, { error: 'Webhook verification failed.' });
  }
};
