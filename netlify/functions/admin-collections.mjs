import { collectionNames, getDb, json, now, toObjectId } from '../lib/secure-db.mjs';
import { canManageAdmins, canRefund, hashPassword, requireAdmin, writeAuditLog } from '../lib/admin-auth.mjs';
import { parseJsonBody, rejectFrontendPrices } from '../lib/commerce-service.mjs';

const resourceConfig = {
  categories: { collection: collectionNames.categories, roles: ['owner', 'manager'] },
  customers: { collection: collectionNames.customers, roles: ['owner', 'manager', 'support'] },
  payments: { collection: collectionNames.payments, roles: ['owner', 'manager'] },
  refunds: { collection: collectionNames.refunds, roles: ['owner'] },
  contactMessages: { collection: collectionNames.contactMessages, roles: ['owner', 'manager', 'support'] },
  newsletterSubscribers: { collection: collectionNames.newsletterSubscribers, roles: ['owner', 'manager'] },
  reviews: { collection: collectionNames.reviews, roles: ['owner', 'manager'] },
  discountCodes: { collection: collectionNames.discountCodes, roles: ['owner', 'manager'] },
  inventoryLogs: { collection: collectionNames.inventoryLogs, roles: ['owner', 'manager'] },
  auditLogs: { collection: collectionNames.auditLogs, roles: ['owner'] },
  storeSettings: { collection: collectionNames.storeSettings, roles: ['owner'] },
  admins: { collection: collectionNames.admins, roles: ['owner'] },
};

const getResource = (event) => {
  const url = new URL(event.rawUrl || `https://local${event.path || ''}`);
  const resource = url.searchParams.get('resource');
  const config = resourceConfig[resource];
  if (!config) {
    const error = new Error('Invalid admin resource');
    error.statusCode = 400;
    throw error;
  }
  return { url, resource, config };
};

const sanitizeBody = (resource, body) => {
  rejectFrontendPrices(body);
  const next = { ...body };
  delete next._id;
  if (resource === 'admins') {
    if (next.password) {
      next.passwordHash = hashPassword(next.password);
      delete next.password;
    }
  }
  if (resource === 'discountCodes' && next.code) next.code = String(next.code).trim().toUpperCase();
  return next;
};

export const handler = async (event) => {
  try {
    const { url, resource, config } = getResource(event);
    const admin = await requireAdmin(event, config.roles);
    const db = await getDb();
    const id = toObjectId(url.searchParams.get('id'));

    if (event.httpMethod === 'GET') {
      const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500);
      const docs = await db.collection(config.collection).find({}).sort({ createdAt: -1 }).limit(limit).toArray();
      return json(200, { [resource]: docs });
    }

    const body = parseJsonBody(event);

    if (resource === 'admins' && !canManageAdmins(admin)) return json(403, { error: 'Only owners can manage admins' });
    if (resource === 'refunds' && ['POST', 'PATCH', 'DELETE'].includes(event.httpMethod) && !canRefund(admin)) return json(403, { error: 'Only owners can process refunds' });

    if (event.httpMethod === 'POST') {
      const doc = { ...sanitizeBody(resource, body), createdAt: now(), updatedAt: now() };
      const result = await db.collection(config.collection).insertOne(doc);
      await writeAuditLog(event, admin, `${resource}_created`, resource, result.insertedId, null, doc);
      return json(201, { id: String(result.insertedId), [resource.slice(0, -1) || resource]: { ...doc, _id: result.insertedId } });
    }

    if (event.httpMethod === 'PATCH') {
      if (!id) return json(400, { error: 'id query parameter is required' });
      const before = await db.collection(config.collection).findOne({ _id: id });
      if (!before) return json(404, { error: 'Record not found' });
      const update = { ...sanitizeBody(resource, body), updatedAt: now() };
      await db.collection(config.collection).updateOne({ _id: id }, { $set: update });
      await writeAuditLog(event, admin, `${resource}_updated`, resource, id, before, update);
      return json(200, { ok: true });
    }

    if (event.httpMethod === 'DELETE') {
      if (!id) return json(400, { error: 'id query parameter is required' });
      const before = await db.collection(config.collection).findOne({ _id: id });
      await db.collection(config.collection).deleteOne({ _id: id });
      await writeAuditLog(event, admin, `${resource}_deleted`, resource, id, before, null);
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Admin collection API failed' });
  }
};
