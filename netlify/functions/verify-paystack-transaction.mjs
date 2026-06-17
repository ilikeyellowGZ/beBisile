import { getDb, json } from '../lib/secure-db.mjs';
import { markPaystackOrderPaid, paystackRequest } from '../lib/paystack-service.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const reference = String(body.reference || event.queryStringParameters?.reference || '').trim();
    if (!reference) return json(400, { error: 'Paystack reference is required' });

    const payload = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, { method: 'GET' });
    const db = await getDb();
    const order = await markPaystackOrderPaid(db, payload.data);

    return json(200, {
      status: payload.data?.status || 'unknown',
      reference,
      orderNumber: order?.orderNumber || payload.data?.metadata?.orderNumber || null,
    });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Paystack verification failed' });
  }
};

