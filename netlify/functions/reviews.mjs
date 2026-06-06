import { collectionNames, getDb, json, now, toObjectId } from '../lib/secure-db.mjs';
import { parseJsonBody } from '../lib/commerce-service.mjs';

export const handler = async (event) => {
  try {
    const db = await getDb();
    const url = new URL(event.rawUrl || `https://local${event.path || ''}`);

    if (event.httpMethod === 'GET') {
      const productId = url.searchParams.get('productId');
      const query = { status: 'approved' };
      const oid = toObjectId(productId);
      if (oid) query.productId = oid;
      else if (productId) query.productId = productId;
      const reviews = await db.collection(collectionNames.reviews).find(query).sort({ createdAt: -1 }).toArray();
      return json(200, { reviews });
    }

    if (event.httpMethod === 'POST') {
      const body = parseJsonBody(event);
      if (!body.productId || !body.rating || !body.comment) return json(400, { error: 'productId, rating, and comment are required' });
      const doc = {
        productId: toObjectId(body.productId) || body.productId,
        customerId: toObjectId(body.customerId) || body.customerId || null,
        rating: Math.max(1, Math.min(5, Number(body.rating))),
        comment: String(body.comment).trim(),
        status: 'pending',
        createdAt: now(),
        updatedAt: now(),
      };
      const result = await db.collection(collectionNames.reviews).insertOne(doc);
      return json(201, { id: String(result.insertedId), ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Reviews failed' });
  }
};
