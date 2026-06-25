import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { getDatabaseName, loadEnv, requireEnv } from './lib/env.mjs';

loadEnv();

const uri = requireEnv('MONGODB_URI');
const dbName = getDatabaseName();
const username = process.env.SEED_ADMIN_USERNAME || 'bisile';
const email = process.env.SEED_ADMIN_EMAIL || 'studio@bisile.co.za';
const password = process.env.SEED_ADMIN_PASSWORD || 'Bisi@2026!';

if (password === 'Bisi@2026!' && process.env.NODE_ENV === 'production') {
  throw new Error('Set SEED_ADMIN_PASSWORD before seeding an admin in production.');
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
      mustChangePassword: password === 'Bisi@2026!',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Seeded development admin in "${dbName}". Username: ${username}. Replace password before production.`);
  }
} finally {
  await client.close();
}
