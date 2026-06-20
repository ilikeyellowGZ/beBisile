import { loadEnv, requireEnv } from './lib/env.mjs';

loadEnv();

const secret = requireEnv('PAYSTACK_SECRET_KEY');
const email = process.env.PAYSTACK_TEST_EMAIL || 'officialheyywebb@gmail.com';
const amount = Number(process.env.PAYSTACK_TEST_AMOUNT || 100);
const reference = `BISILE-TEST-${Date.now()}`;

if (!secret.startsWith('sk_test_')) {
  console.warn('Warning: PAYSTACK_SECRET_KEY does not look like a test key. This script initializes a checkout transaction only.');
}

const response = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    amount: String(Math.round(amount * 100)),
    currency: 'ZAR',
    reference,
    metadata: {
      source: 'bisile_test_paystack_script',
      note: 'Smoke test transaction. No local order is created.',
    },
  }),
});

const payloadText = await response.text();
let payload = {};
try {
  payload = payloadText ? JSON.parse(payloadText) : {};
} catch {
  payload = { raw: payloadText };
}

if (!response.ok || payload.status === false) {
  console.error('Paystack test transaction failed:', payload);
  process.exit(1);
}

console.log('Paystack test transaction created.');
console.log(`Reference: ${payload.data?.reference || reference}`);
console.log(`Authorization URL: ${payload.data?.authorization_url || 'not returned'}`);
