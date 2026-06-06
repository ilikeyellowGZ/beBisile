import { collectionNames, getDb, json, now } from '../lib/secure-db.mjs';
import { signAdminToken, verifyPassword, writeAuditLog } from '../lib/admin-auth.mjs';
import { parseJsonBody } from '../lib/commerce-service.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { email, password } = parseJsonBody(event);
    if (!email || !password) return json(400, { error: 'Email and password are required' });

    const db = await getDb();
    const admin = await db.collection(collectionNames.admins).findOne({ email: String(email).toLowerCase(), isActive: { $ne: false } });
    if (!admin || !verifyPassword(password, admin.passwordHash)) return json(401, { error: 'Invalid admin login' });

    await db.collection(collectionNames.admins).updateOne({ _id: admin._id }, { $set: { lastLoginAt: now(), updatedAt: now() } });
    await writeAuditLog(event, admin, 'admin_login', 'admin', admin._id, null, { email: admin.email });

    return json(200, {
      token: signAdminToken(admin),
      admin: {
        id: String(admin._id),
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Login failed' });
  }
};
