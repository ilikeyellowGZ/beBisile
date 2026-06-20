import { collectionNames, getDb, json, now } from '../lib/secure-db.mjs';
import { hashPassword, signAdminToken, writeAuditLog } from '../lib/admin-auth.mjs';
import { parseJsonBody } from '../lib/commerce-service.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const db = await getDb();
    const existingOwner = await db.collection(collectionNames.admins).findOne({ role: 'owner' });
    if (existingOwner) return json(409, { error: 'Owner admin already exists' });

    const body = parseJsonBody(event);
    if (!body.email || !body.password || !body.fullName) return json(400, { error: 'fullName, email, and password are required' });
    if (String(body.password).length < 10) return json(400, { error: 'Password must be at least 10 characters' });

    const admin = {
      fullName: body.fullName,
      email: String(body.email).toLowerCase(),
      username: String(body.username || 'admin').toLowerCase(),
      passwordHash: hashPassword(body.password, 'bcrypt'),
      role: 'owner',
      avatar: '',
      isActive: true,
      lastLoginAt: now(),
      createdAt: now(),
      updatedAt: now(),
    };

    const result = await db.collection(collectionNames.admins).insertOne(admin);
    const saved = { ...admin, _id: result.insertedId };
    await writeAuditLog(event, saved, 'admin_user_created', 'admin', saved._id, null, { role: 'owner', email: saved.email });

    return json(201, {
      token: signAdminToken(saved),
      admin: {
        id: String(saved._id),
        fullName: saved.fullName,
        email: saved.email,
        role: saved.role,
      },
    });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Admin setup failed' });
  }
};
