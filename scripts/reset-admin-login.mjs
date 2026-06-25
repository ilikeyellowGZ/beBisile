import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { getDatabaseName, loadEnv, requireEnv } from './lib/env.mjs';

loadEnv();

const uri = requireEnv('MONGODB_URI');
const dbName = getDatabaseName();
const currentIdentifier = requireEnv('RESET_ADMIN_CURRENT');
const username = requireEnv('RESET_ADMIN_USERNAME').toLowerCase().trim();
const email = requireEnv('RESET_ADMIN_EMAIL').toLowerCase().trim();
const password = requireEnv('RESET_ADMIN_PASSWORD');

if (password.length < 10) {
  throw new Error('RESET_ADMIN_PASSWORD must be at least 10 characters.');
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const admins = db.collection('admins');
  const current = currentIdentifier.toLowerCase().trim();
  const result = await admins.findOneAndUpdate(
    { $or: [{ username: current }, { email: current }] },
    {
      $set: {
        username,
        email,
        passwordHash: bcrypt.hashSync(password, 12),
        role: 'owner',
        isActive: true,
        mustChangePassword: false,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        fullName: 'BISILE Admin',
        avatar: '',
        createdAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log(`Admin login updated in "${dbName}". Username: ${result.username || username}.`);
} finally {
  await client.close();
}
