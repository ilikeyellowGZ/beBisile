import { collectionNames, getDb, json } from '../lib/secure-db.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const db = await getDb();
    const categories = await db.collection(collectionNames.categories).find({ isActive: { $ne: false } }).sort({ name: 1 }).toArray();
    return json(200, { categories });
  } catch (error) {
    return json(500, { error: error.message || 'Categories failed' });
  }
};
