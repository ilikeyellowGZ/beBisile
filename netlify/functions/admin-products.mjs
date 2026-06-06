import { collectionNames, getDb, json, now, toObjectId } from '../lib/secure-db.mjs';
import { canChangePrices, requireAdmin, writeAuditLog } from '../lib/admin-auth.mjs';
import { parseJsonBody, rejectFrontendPrices } from '../lib/commerce-service.mjs';

const publicFields = ['name', 'slug', 'description', 'shortDescription', 'categoryId', 'images', 'compareAtPrice', 'currency', 'stripeProductId', 'stripePriceId', 'sku', 'stock', 'lowStockThreshold', 'sizes', 'variants', 'scentNotes', 'productDetails', 'ingredients', 'materials', 'tags', 'isFeatured', 'isActive', 'isArchived'];

const pick = (body, fields) => Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

export const handler = async (event) => {
  try {
    const admin = await requireAdmin(event, ['owner', 'manager']);
    const db = await getDb();
    const url = new URL(event.rawUrl || `https://local${event.path || ''}`);
    const id = toObjectId(url.searchParams.get('id'));

    if (event.httpMethod === 'GET') {
      const products = await db.collection(collectionNames.products).find({}).sort({ createdAt: -1 }).toArray();
      return json(200, { products });
    }

    const body = parseJsonBody(event);

    if (event.httpMethod === 'POST') {
      if (!body.name || body.price === undefined) return json(400, { error: 'name and backend-controlled price are required' });
      if (!canChangePrices(admin)) return json(403, { error: 'Only owner admins can create or change product prices' });
      const doc = { ...pick(body, publicFields), price: Number(body.price), createdAt: now(), updatedAt: now() };
      const result = await db.collection(collectionNames.products).insertOne(doc);
      await writeAuditLog(event, admin, 'product_created', 'product', result.insertedId, null, doc);
      return json(201, { id: String(result.insertedId), product: { ...doc, _id: result.insertedId } });
    }

    if (event.httpMethod === 'PATCH') {
      if (!id) return json(400, { error: 'id query parameter is required' });
      const before = await db.collection(collectionNames.products).findOne({ _id: id });
      if (!before) return json(404, { error: 'Product not found' });

      const isPriceRoute = url.searchParams.get('action') === 'price';
      if (isPriceRoute || body.price !== undefined) {
        if (!canChangePrices(admin)) return json(403, { error: 'Only owner admins can change prices' });
      } else {
        rejectFrontendPrices(body);
      }

      const update = isPriceRoute
        ? { price: Number(body.price), compareAtPrice: body.compareAtPrice, stripePriceId: body.stripePriceId }
        : pick(body, publicFields);

      await db.collection(collectionNames.products).updateOne({ _id: id }, { $set: { ...update, updatedAt: now() } });
      await writeAuditLog(event, admin, body.price !== undefined ? 'product_price_changed' : 'product_updated', 'product', id, before, update);
      return json(200, { ok: true });
    }

    if (event.httpMethod === 'DELETE') {
      if (!id) return json(400, { error: 'id query parameter is required' });
      const before = await db.collection(collectionNames.products).findOne({ _id: id });
      await db.collection(collectionNames.products).updateOne({ _id: id }, { $set: { isArchived: true, isActive: false, updatedAt: now() } });
      await writeAuditLog(event, admin, 'product_deleted', 'product', id, before, { isArchived: true });
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Products API failed' });
  }
};
