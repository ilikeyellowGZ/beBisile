import { getDb, json } from '../lib/secure-db.mjs';
import { markPaystackOrderPaid, verifyPaystackSignature } from '../lib/paystack-service.mjs';

const rawBody = (event) => event.isBase64Encoded
  ? Buffer.from(event.body || '', 'base64')
  : Buffer.from(event.body || '', 'utf8');

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const bodyBuffer = rawBody(event);
    const signature = event.headers['x-paystack-signature'] || event.headers['X-Paystack-Signature'];
    if (!verifyPaystackSignature(bodyBuffer, signature)) return json(401, { error: 'Invalid Paystack signature' });

    const paystackEvent = JSON.parse(bodyBuffer.toString('utf8') || '{}');
    if (paystackEvent.event === 'charge.success') {
      const db = await getDb();
      await markPaystackOrderPaid(db, paystackEvent.data);
    }

    return json(200, { received: true });
  } catch (error) {
    return json(error.statusCode || 400, { error: error.message || 'Paystack webhook failed' });
  }
};

