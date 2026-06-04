import { getDatabase } from '../lib/mongo.mjs';
import { createAdminSession, normalizeUsername, parseJsonBody, verifyPassword } from '../lib/auth.mjs';
import { json } from '../lib/response.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  try {
    const { username, password } = parseJsonBody(event);
    const normalizedUsername = normalizeUsername(username);
    const db = await getDatabase();
    const user = await db.collection('adminUsers').findOne({ username: normalizedUsername, active: { $ne: false } });

    if (!verifyPassword(password, user)) {
      return json(401, { error: 'Invalid dashboard username or password.' });
    }

    const session = await createAdminSession(db, user._id);
    return json(200, {
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      user: { username: user.username },
    });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Unable to log in to dashboard.' });
  }
};
