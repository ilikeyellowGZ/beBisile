import { collectionNames, getDb, json, now } from '../lib/secure-db.mjs';
import { parseJsonBody } from '../lib/commerce-service.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = parseJsonBody(event);
    const email = String(body.email || '').trim().toLowerCase();
    if (!email.includes('@')) return json(400, { error: 'Valid email is required' });
    const db = await getDb();
    await db.collection(collectionNames.newsletterSubscribers).updateOne(
      { email },
      {
        $set: { source: body.source || 'website', status: 'active', updatedAt: now() },
        $setOnInsert: { email, subscribedAt: now(), createdAt: now() },
      },
      { upsert: true }
    );
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error.message || 'Newsletter failed' });
  }
};
