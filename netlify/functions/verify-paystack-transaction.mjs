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
    if (payload.data?.status === 'success' && !order) {
      return json(404, {
        success: false,
        status: payload.data.status,
        reference,
        message: 'Verified payment succeeded, but the matching BISILE order was not found.',
      });
    }

    return json(200, {
      success: true,
      status: payload.data?.status || 'unknown',
      reference,
      orderNumber: order?.orderNumber || payload.data?.metadata?.orderNumber || null,
      customerName: order?.customerInfo?.fullName || payload.data?.metadata?.customerName || null,
      orderTotal: order?.totalAmount || null,
      currency: order?.currency || payload.data?.currency || 'ZAR',
      shippingOption: order?.shippingPartner?.name || order?.shippingPartner?.id || payload.data?.metadata?.shippingPartner || null,
      paymentStatus: order?.paymentStatus || payload.data?.status || 'unknown',
    });
  } catch (error) {
    return json(error.statusCode || 500, { success: false, message: error.message || 'Paystack verification failed', error: error.message || 'Paystack verification failed' });
  }
};
