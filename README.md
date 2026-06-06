# BISILE | Be Luxury

A light editorial React storefront for BISILE fragrance, hair, pamper packages, creator applications, WhatsApp support, and Stripe Checkout.

## Local UI

1. Copy `.env.example` to `.env`.
2. Set `VITE_WHATSAPP_NUMBER` to the official WhatsApp number using digits only, including the country code.
3. Run `npm install`.
4. Run `npm run dev`.

## Environment Variables

Create the real local environment file at the project root:

```text
.env
```

Use `.env.example` as the template. The real `.env` file should not be committed to GitHub; it can contain private values for Stripe, MongoDB, dashboard auth, and optional services.

Public browser variables must start with `VITE_` because this project uses Vite:

- `VITE_WHATSAPP_NUMBER`: public WhatsApp number used by enquiry and contact buttons.
- `VITE_CHECKOUT_API_URL`: optional public checkout endpoint override. Leave blank on Netlify.
- `VITE_ENABLE_VIDEO_HERO`: public toggle for the desktop split-screen video hero.

Server-only variables must not use the `VITE_` prefix:

- `CLIENT_URL`: public production URL used by backend checkout redirects and origin checks.
- `MONGODB_URI`, `MONGODB_DB`, `MONGODB_DATABASE`: MongoDB connection and database names.
- `JWT_SECRET`, `ADMIN_JWT_SECRET`, `ADMIN_PASSWORD_SECRET`: dashboard/auth secrets.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Stripe backend and webhook secrets.
- `NODE_ENV`, `PORT`, `SERVER_URL`, `CORS_ORIGINS`: optional server configuration.
- `RESEND_API_KEY`, `SENDGRID_API_KEY`, `FROM_EMAIL`: optional email settings.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: optional image upload settings.

After editing `.env`, restart the dev server so Vite and any backend process can read the new values.

## Stripe, MongoDB, and Dashboard

The production flow uses Netlify Functions:

- `create-checkout-session`: recalculates product prices on the server, creates a MongoDB order, and opens Stripe Checkout.
- `stripe-webhook`: verifies Stripe signatures and marks successful orders as paid.
- `admin-setup`: creates the first dashboard owner admin user in MongoDB.
- `admin-login`: checks the MongoDB admin email/password and returns a temporary dashboard session.
- `orders`: returns recent orders only when a valid dashboard session is supplied.

Configure the server-only values from `.env.example` in Netlify. Never expose `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, or `ADMIN_PASSWORD_SECRET` as `VITE_` variables.

Create the first dashboard user by sending a POST request to:

```text
https://your-domain.example/.netlify/functions/admin-setup
```

With JSON:

```json
{
  "email": "admin@example.com",
  "password": "use-a-long-password",
  "fullName": "BISILE Admin"
}
```

The password is hashed before being stored in the `adminUsers` collection inside the `MONGODB_DATABASE` database, so this project can share the same MongoDB cluster while keeping Bisile data separate.

Register this webhook endpoint in Stripe:

```text
https://your-domain.example/.netlify/functions/stripe-webhook
```

The private dashboard is available at:

```text
https://your-domain.example/#/dashboard
```

`STRIPE_WEBHOOK_SECRET` is the `whsec_...` signing secret Stripe gives you for this webhook endpoint. It lets the server verify that payment events really came from Stripe.

## Production

Run `npm run build` to create the deployable `dist` folder. `netlify.toml` configures the build and serverless function directory.
