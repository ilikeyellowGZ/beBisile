# BISILE | Be Luxury

A light editorial React storefront for BISILE fragrance, hair, pamper packages, creator applications, WhatsApp support, and Stripe Checkout.

## Local UI

1. Copy `.env.example` to `.env`.
2. Set `VITE_WHATSAPP_NUMBER` to the official WhatsApp number using digits only, including the country code.
3. Run `npm install`.
4. Run `npm run dev`.

## Stripe, MongoDB, and Dashboard

The production flow uses Netlify Functions:

- `create-checkout-session`: recalculates product prices on the server, creates a MongoDB order, and opens Stripe Checkout.
- `stripe-webhook`: verifies Stripe signatures and marks successful orders as paid.
- `admin-setup`: creates or updates a dashboard admin user in MongoDB using `DASHBOARD_SETUP_TOKEN`.
- `admin-login`: checks the MongoDB admin username/password and returns a temporary dashboard session.
- `orders`: returns recent orders only when a valid dashboard session is supplied.

Configure the server-only values from `.env.example` in Netlify. Never expose `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MONGODB_URI`, or `DASHBOARD_SETUP_TOKEN` as `VITE_` variables.

Create the first dashboard user by sending a POST request to:

```text
https://your-domain.example/.netlify/functions/admin-setup
```

With JSON:

```json
{
  "username": "admin",
  "password": "use-a-long-password",
  "setupToken": "the-value-from-DASHBOARD_SETUP_TOKEN"
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
