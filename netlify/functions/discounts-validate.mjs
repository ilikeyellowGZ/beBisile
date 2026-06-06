import { json } from '../lib/secure-db.mjs';
import { calculateTrustedCheckout, parseJsonBody, rejectFrontendPrices } from '../lib/commerce-service.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = parseJsonBody(event);
    rejectFrontendPrices(body);
    const trusted = await calculateTrustedCheckout({ items: body.items, discountCode: body.discountCode });
    return json(200, {
      discountCode: trusted.discountCode,
      discountAmount: trusted.discountAmount,
      subtotal: trusted.subtotal,
      deliveryFee: trusted.deliveryFee,
      taxAmount: trusted.taxAmount,
      totalAmount: trusted.totalAmount,
      currency: trusted.currency,
    });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Discount validation failed' });
  }
};
