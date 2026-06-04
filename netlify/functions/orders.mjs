import { getDatabase } from '../lib/mongo.mjs';
import { validateAdminSession } from '../lib/auth.mjs';
import { json } from '../lib/response.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed.' });

  try {
    const db = await getDatabase();
    const admin = await validateAdminSession(event, db);
    if (!admin) return json(401, { error: 'Please log in to the dashboard again.' });

    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(100).toArray();
    return json(200, { orders });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Unable to load orders.' });
  }
};
