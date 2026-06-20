import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { getDatabaseName, loadEnv, requireEnv } from './lib/env.mjs';

loadEnv();

const uri = requireEnv('MONGODB_URI');
const dbName = getDatabaseName();
const username = process.env.SEED_ADMIN_USERNAME || 'admin';
const email = process.env.SEED_ADMIN_EMAIL || 'admin@bisile.local';
const password = process.env.SEED_ADMIN_PASSWORD || 'password123';

if (password === 'password123' && process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed the development admin password in production.');
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const admins = db.collection('admins');
  await admins.createIndex({ email: 1 }, { unique: true });
  await admins.createIndex({ username: 1 });

  const existing = await admins.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existing) {
    console.log(`Admin already exists in "${dbName}" for username/email "${username}".`);
  } else {
    await admins.insertOne({
      fullName: 'BISILE Admin',
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 12),
      role: 'owner',
      avatar: '',
      isActive: true,
      mustChangePassword: password === 'password123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Seeded development admin in "${dbName}". Username: ${username}. Replace password before production.`);
  }
} finally {
  await client.close();
}
