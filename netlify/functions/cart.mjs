import crypto from 'crypto';
import { collectionNames, getDb, json, now } from '../lib/secure-db.mjs';
import { calculateTrustedCheckout, parseJsonBody, rejectFrontendPrices } from '../lib/commerce-service.mjs';

export const handler = async (event) => {
  try {
    const db = await getDb();
    const url = new URL(event.rawUrl || `https://local${event.path || ''}`);
    const sessionId = url.searchParams.get('sessionId');

    if (event.httpMethod === 'GET') {
      if (!sessionId) return json(400, { error: 'sessionId is required' });
      const cart = await db.collection(collectionNames.carts).findOne({ sessionId });
      if (!cart) return json(200, { cart: null, totals: null });
      const trusted = await calculateTrustedCheckout({ items: cart.items || [], discountCode: cart.discountCode });
      return json(200, {
        cart,
        totals: {
          subtotal: trusted.subtotal,
          discountAmount: trusted.discountAmount,
          deliveryFee: trusted.deliveryFee,
          taxAmount: trusted.taxAmount,
          totalAmount: trusted.totalAmount,
          currency: trusted.currency,
        },
      });
    }

    if (event.httpMethod === 'POST' || event.httpMethod === 'PATCH') {
      const body = parseJsonBody(event);
      rejectFrontendPrices(body);
      const id = body.sessionId || sessionId || crypto.randomUUID();
      const items = Array.isArray(body.items) ? body.items.map((item) => ({
        productId: item.productId || item.id,
        quantity: Number(item.quantity),
        selectedVariant: item.selectedVariant || item.variant || null,
      })) : [];
      await calculateTrustedCheckout({ items, discountCode: body.discountCode });
      await db.collection(collectionNames.carts).updateOne(
        { sessionId: id },
        {
          $set: { items, discountCode: body.discountCode || null, updatedAt: now(), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) },
          $setOnInsert: { sessionId: id, customerId: null, createdAt: now() },
        },
        { upsert: true }
      );
      return json(200, { sessionId: id });
    }

    if (event.httpMethod === 'DELETE') {
      if (!sessionId) return json(400, { error: 'sessionId is required' });
      await db.collection(collectionNames.carts).deleteOne({ sessionId });
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Cart failed' });
  }
};
