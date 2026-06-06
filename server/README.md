# BISILE Secure API

Production Express/Mongoose backend scaffold for BISILE admin, catalog, orders, checkout, Stripe webhooks, and dashboard management.

## Security Invariant

Frontend requests must never send trusted price fields. Checkout/cart requests may send only:

- `productId`
- `quantity`
- `selectedVariant`
- customer/shipping details
- optional discount code

The backend fetches products from MongoDB, validates active status and stock, uses backend-controlled `price` and `stripePriceId`, creates a pending order, and only Stripe webhooks can mark an order as paid.

## Required Env

```env
MONGODB_URI=
MONGODB_DB=bisile
JWT_SECRET=change-me-32-plus-characters
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLIENT_URL=https://your-site.example
SERVER_URL=https://your-api.example
CORS_ORIGINS=
RESEND_API_KEY=
SENDGRID_API_KEY=
FROM_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Commands

```bash
npm install
npm run dev
npm run build
npm start
```

## Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/admin/dashboard/stats`
- `GET/POST/PATCH/DELETE /api/admin/products`
- `GET/POST/PATCH/DELETE /api/admin/categories`
- `GET/POST/PATCH/DELETE /api/admin/orders`
- `GET/POST/PATCH/DELETE /api/admin/customers`
- `GET/POST/PATCH/DELETE /api/admin/payments`
- `GET/POST/PATCH/DELETE /api/admin/refunds`
- `GET/POST/PATCH/DELETE /api/admin/contact-messages`
- `GET/POST/PATCH/DELETE /api/admin/newsletter`
- `GET/POST/PATCH/DELETE /api/admin/reviews`
- `GET/POST/PATCH/DELETE /api/admin/discounts`
- `GET/POST/PATCH/DELETE /api/admin/inventory`
- `GET/POST/PATCH/DELETE /api/admin/audit-logs`
- `GET/POST/PATCH/DELETE /api/admin/settings`
- `POST /api/checkout/create-session`
- `POST /api/webhooks/stripe`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/categories`
- `POST /api/contact`
- `POST /api/newsletter/subscribe`
- `POST /api/reviews`
- `GET /api/products/:productId/reviews`
