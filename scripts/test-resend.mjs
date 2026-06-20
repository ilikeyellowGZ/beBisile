import { MongoClient } from 'mongodb';
import { getDatabaseName, loadEnv, requireEnv } from './lib/env.mjs';

loadEnv();

const apiKey = requireEnv('RESEND_API_KEY');
const from = requireEnv('FROM_EMAIL');
const to = process.env.TEST_EMAIL_TO || 'officialheyywebb@gmail.com';

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from,
    to,
    subject: 'BISILE Test Email',
    text: 'This is a test email from the BISILE website backend. If you received this, Resend is working.',
  }),
});

const payloadText = await response.text();
let payload = {};
try {
  payload = payloadText ? JSON.parse(payloadText) : {};
} catch {
  payload = { raw: payloadText };
}

if (!response.ok) {
  console.error('Resend test failed:', payload);
  process.exit(1);
}

if (process.env.MONGODB_URI) {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    await client.db(getDatabaseName()).collection('emailLogs').insertOne({
      provider: 'resend',
      type: 'test',
      to,
      from,
      subject: 'BISILE Test Email',
      providerResponse: payload,
      status: 'sent',
      createdAt: new Date(),
    });
  } finally {
    await client.close();
  }
}

console.log(`Resend test email accepted for ${to}. Response id: ${payload.id || 'unknown'}`);
