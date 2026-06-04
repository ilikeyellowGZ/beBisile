import { timingSafeEqual } from 'node:crypto';
import { getDatabase } from '../lib/mongo.mjs';
import { hashPassword, normalizeUsername, parseJsonBody } from '../lib/auth.mjs';
import { json } from '../lib/response.mjs';

const secureCompare = (expected, supplied) => {
  if (!expected || !supplied || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  try {
    const { username, password, setupToken } = parseJsonBody(event);
    if (!secureCompare(process.env.DASHBOARD_SETUP_TOKEN || '', String(setupToken || ''))) {
      return json(401, { error: 'Invalid dashboard setup token.' });
    }

    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername || String(password || '').length < 8) {
      return json(400, { error: 'Use a username and a password with at least 8 characters.' });
    }

    const db = await getDatabase();
    await db.collection('adminUsers').createIndex({ username: 1 }, { unique: true });
    await db.collection('adminSessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    const passwordRecord = hashPassword(password);
    const result = await db.collection('adminUsers').updateOne(
      { username: normalizedUsername },
      {
        $setOnInsert: {
          username: normalizedUsername,
          createdAt: new Date(),
        },
        $set: {
          passwordHash: passwordRecord.hash,
          passwordSalt: passwordRecord.salt,
          passwordIterations: passwordRecord.iterations,
          active: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return json(200, {
      ok: true,
      message: result.upsertedCount ? 'Dashboard admin created.' : 'Dashboard admin password updated.',
    });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Unable to set up dashboard admin.' });
  }
};
