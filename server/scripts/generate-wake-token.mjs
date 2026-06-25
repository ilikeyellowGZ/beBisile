import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  console.error('Set JWT_SECRET to a 32+ character value before generating a wake token.');
  process.exit(1);
}

const token = jwt.sign(
  {
    sub: 'bisile-frontend',
    scope: 'wake',
    aud: 'bisile-frontend',
  },
  secret,
  { expiresIn: process.env.WAKE_TOKEN_EXPIRES_IN || '180d' }
);

console.log(token);
