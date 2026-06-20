import { MongoClient } from 'mongodb';
import { getDatabaseName, loadEnv, requireEnv } from './lib/env.mjs';

loadEnv();

const uri = requireEnv('MONGODB_URI');
const dbName = getDatabaseName();
const requiredCollections = [
  'users',
  'admins',
  'products',
  'orders',
  'customers',
  'payments',
  'shippingOptions',
  'emailLogs',
  'uploads',
  'categories',
  'adminLogs',
  'auditLogs',
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);

  for (const name of requiredCollections) {
    await db.createCollection(name).catch((error) => {
      if (error.codeName !== 'NamespaceExists') throw error;
    });
  }

  const probe = {
    type: 'db_test',
    createdAt: new Date(),
  };
  const result = await db.collection('adminLogs').insertOne(probe);
  await db.collection('adminLogs').deleteOne({ _id: result.insertedId });

  const collections = await db.listCollections().toArray();
  console.log(`Connected to MongoDB database "${dbName}".`);
  console.log(`Verified read/write access. Collections visible: ${collections.map((item) => item.name).sort().join(', ')}`);
} finally {
  await client.close();
}
