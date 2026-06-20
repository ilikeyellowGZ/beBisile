import { MongoClient } from 'mongodb';
import { getDatabaseName, loadEnv, requireEnv } from './lib/env.mjs';
import { categories, products, shippingOptions } from './lib/catalog.mjs';

loadEnv();

const uri = requireEnv('MONGODB_URI');
const dbName = getDatabaseName();
const now = () => new Date();

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);

  await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
  await db.collection('products').createIndex({ id: 1 }, { unique: true });
  await db.collection('products').createIndex({ slug: 1 }, { unique: true });
  await db.collection('shippingOptions').createIndex({ id: 1 }, { unique: true });

  for (const category of categories) {
    await db.collection('categories').updateOne(
      { slug: category.slug },
      { $set: { ...category, updatedAt: now() }, $setOnInsert: { createdAt: now() } },
      { upsert: true }
    );
  }

  for (const product of products) {
    await db.collection('products').updateOne(
      { id: product.id },
      {
        $set: {
          ...product,
          description: product.description || product.name,
          currency: 'ZAR',
          lowStockThreshold: 3,
          isActive: true,
          isArchived: false,
          updatedAt: now(),
        },
        $setOnInsert: { createdAt: now() },
      },
      { upsert: true }
    );
  }

  for (const option of shippingOptions) {
    await db.collection('shippingOptions').updateOne(
      { id: option.id },
      { $set: { ...option, updatedAt: now() }, $setOnInsert: { createdAt: now() } },
      { upsert: true }
    );
  }

  await db.collection('storeSettings').updateOne(
    { key: 'default' },
    {
      $set: {
        key: 'default',
        currency: 'ZAR',
        deliveryFee: 0,
        taxRate: 0,
        updatedAt: now(),
      },
      $setOnInsert: { createdAt: now() },
    },
    { upsert: true }
  );

  console.log(`Seeded ${products.length} products, ${categories.length} categories, and ${shippingOptions.length} shipping options in "${dbName}".`);
} finally {
  await client.close();
}
