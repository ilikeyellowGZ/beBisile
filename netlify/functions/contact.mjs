import { collectionNames, getDb, json, now } from '../lib/secure-db.mjs';
import { parseJsonBody } from '../lib/commerce-service.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = parseJsonBody(event);
    if (!body.fullName || !body.email || !body.message) return json(400, { error: 'fullName, email, and message are required' });
    const db = await getDb();
    const doc = {
      fullName: String(body.fullName).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: String(body.phone || '').trim(),
      subject: String(body.subject || 'Website enquiry').trim(),
      message: String(body.message).trim(),
      status: 'new',
      createdAt: now(),
      updatedAt: now(),
    };
    const result = await db.collection(collectionNames.contactMessages).insertOne(doc);
    return json(201, { id: String(result.insertedId), ok: true });
  } catch (error) {
    return json(500, { error: error.message || 'Contact failed' });
  }
};
