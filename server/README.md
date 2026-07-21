# BISILE Secure API

Express/Mongoose backend for BISILE admin, catalog, orders, checkout, Paystack webhooks, dashboard management, and serving the built Vite app in production.

## Local Development

```bash
npm install
npm run dev
```

Copy `server/.env.example` to `server/.env` for local backend testing. Real secrets must not be committed.

The backend listens on:

```text
process.env.PORT || 5000
```

Health check:

```text
GET /api/health
Response: { "success": true, "status": "online", "timestamp": "..." }
```

Readiness check (includes the MongoDB connection state):

```text
GET /api/health/ready
```

## Render Deployment

Render service type:

```text
Web Service
```

Suggested Render settings:

- Runtime: Node
- Root directory: leave blank
- Build command: `npm install && npm --prefix server install && npm run build && npm --prefix server run build`
- Start command: `npm --prefix server start`
- Environment: Node

Render provides the `PORT` environment variable automatically. The backend URL will look like:

```text
https://your-service-name.onrender.com
```

When the frontend is served by the same Render service, leave `VITE_API_BASE_URL` blank so requests use `/api/*` on the same origin. If the frontend is hosted separately, use that Render URL as `VITE_API_BASE_URL`.

## Required Environment Variables

- `NODE_ENV`: use `production` on Render.
- `PORT`: local port only; Render sets it automatically.
- `FRONTEND_URL`: final frontend URL allowed by CORS, later the DirectAdmin domain.
- `CLIENT_URL`: optional checkout redirect URL. Leave blank to use `FRONTEND_URL`.
- `MONGODB_URI`: MongoDB connection string.
- `MONGODB_DB`: MongoDB database name.
- `JWT_SECRET`: 32+ character auth secret.
- `PAYSTACK_SECRET_KEY`: secret backend Paystack key used to initialize, verify, and validate payment webhooks.
- `SERVER_URL`, `CORS_ORIGINS`, email, and Cloudinary variables are optional.

## Security Invariant

Frontend requests must never send trusted price fields. Checkout/cart requests may send only:

- `productId`
- `quantity`
- `selectedVariant`
- customer/shipping details
- optional discount code

The backend fetches products from MongoDB, validates active status and stock, uses backend-controlled `price`, creates a pending order, and only verified Paystack transactions can mark an order as paid.

## Routes

- `GET /api/health`
- `GET /api/health/ready`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/admin/dashboard/stats`
- `GET/POST/PATCH/DELETE /api/admin/products`
- `GET/POST/PATCH/DELETE /api/admin/categories`
- `GET/POST/PATCH/DELETE /api/admin/orders`
- `GET/POST/PATCH/DELETE /api/admin/customers`
- `GET /api/admin/customers/:id/history` (authenticated purchase history)
- `GET/POST/PATCH/DELETE /api/admin/payments`
- `GET/POST/PATCH/DELETE /api/admin/refunds`
- `GET/POST/PATCH/DELETE /api/admin/contact-messages`
- `GET/POST/PATCH/DELETE /api/admin/newsletter`
- `GET/POST/PATCH/DELETE /api/admin/reviews`
- `GET/POST/PATCH/DELETE /api/admin/discounts`
- `GET/POST/PATCH/DELETE /api/admin/inventory`
- `GET/POST/PATCH/DELETE /api/admin/audit-logs`
- `GET/POST/PATCH/DELETE /api/admin/settings`
- `POST /api/checkout/create-paystack-transaction`
- `POST /api/checkout/verify-paystack-transaction`
- `POST /api/webhooks/paystack`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/categories`
- `POST /api/contact`
- `POST /api/newsletter/subscribe`
- `POST /api/reviews`
- `GET /api/products/:productId/reviews`
