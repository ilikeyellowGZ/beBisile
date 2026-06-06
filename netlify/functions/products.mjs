import { collectionNames, getDb, json } from '../lib/secure-db.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  try {
    const db = await getDb();
    const url = new URL(event.rawUrl || `https://local${event.path || ''}`);
    const slug = url.searchParams.get('slug');
    const query = { isActive: { $ne: false }, isArchived: { $ne: true } };
    if (slug) query.slug = slug;
    const products = await db.collection(collectionNames.products).find(query, {
      projection: {
        cost: 0,
      },
    }).sort({ isFeatured: -1, createdAt: -1 }).toArray();
    return json(200, slug ? { product: products[0] || null } : { products });
  } catch (error) {
    return json(500, { error: error.message || 'Products failed' });
  }
};
