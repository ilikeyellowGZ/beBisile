# BISILE | Be Luxury

Luxury React storefront for BISILE fragrance, processed virgin hair, wig laundry services, pamper packages, cart, checkout, dashboard, and customer support.

## Project Overview

- Frontend: Vite, React, TypeScript, Tailwind-style utility classes.
- Final frontend host: DirectAdmin static hosting.
- Final backend host: Render Web Service.
- Backend: Express/Mongoose API in `server/`.

## Current Status

- Production frontend: https://bisile.co.za/
- Production backend: https://bebisile.onrender.com/
- Database: MongoDB Atlas database name `bisile`
- Admin login: use `https://bisile.co.za/admin` (or `/bisile-studio`). The backend accepts the configured admin username or email; the password is server-side only and must never be placed in frontend env or committed files.
- Cloudinary: migration script and mapping helper are ready; dry-run checks active website assets only. Actual upload still requires running `npm run migrate:cloudinary` with network/upload approval.
- Local image fallback: local assets remain in the repo and are used whenever `src/data/cloudinary-image-map.json` has no matching Cloudinary URL.

Backend/server secrets must not be exposed as frontend `VITE_` variables. The production frontend uses the Render API origin through `VITE_API_BASE_URL`.

For the requested owner account, set these on Render before running the reset script from a secure machine: `RESET_ADMIN_CURRENT=admin`, `RESET_ADMIN_USERNAME=admin`, `RESET_ADMIN_EMAIL=studio@bisile.co.za`, and `RESET_ADMIN_PASSWORD` to the password you supplied. Keep `RESET_ADMIN_PASSWORD` out of `.env.example`, Git, screenshots, and chat. The reset script stores only a bcrypt hash in MongoDB.

## Local Development

```bash
npm install
npm run dev
```

For local checkout on `http://localhost:3000`, run the Express API in a second terminal:

```bash
npm --prefix server install
npm run dev:api
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:5000`. The payment page calls the Express API, so Vite alone is not enough unless the Express API is also running.

## Environment Variables

Create the real local environment file at the project root:

```text
.env
```

Use `.env.example` as the template. The real `.env` file should not be committed to GitHub; it can contain private values for Paystack, MongoDB, dashboard auth, and optional services.

Public browser variables must start with `VITE_` because this project uses Vite:

- `VITE_SITE_NAME`, `VITE_SITE_URL`: public site metadata.
- `VITE_API_BASE_URL`: optional public API base URL, for example the Render backend URL.
- `VITE_PAYSTACK_PUBLIC_KEY`: optional public Paystack key if a future inline flow needs it. The current hosted checkout flow does not require it in browser code.
- `VITE_WHATSAPP_NUMBER`: public WhatsApp number used by enquiry and contact buttons.
- `VITE_PAYSTACK_CHECKOUT_API_URL`: optional public checkout endpoint override. Leave blank for the Render API.
- `VITE_PAYSTACK_VERIFY_API_URL`: optional public payment verification endpoint override. Leave blank for the Render API.
- `VITE_ENABLE_VIDEO_HERO`: public toggle for the desktop split-screen video hero.

Server-only variables must not use the `VITE_` prefix:

- `CLIENT_URL`: public production URL used by backend checkout redirects and origin checks.
- `MONGODB_URI`, `MONGODB_DB_NAME`, `MONGODB_DB`, `MONGODB_DATABASE`: MongoDB connection and database names. Use `bisile` for this website so other cluster databases remain untouched.
- `JWT_SECRET`, `ADMIN_JWT_SECRET`, `ADMIN_PASSWORD_SECRET`: dashboard/auth secrets.
- `PAYSTACK_SECRET_KEY`: Paystack backend secret used to initialize, verify, and validate payment webhooks.
- `NODE_ENV`, `PORT`, `SERVER_URL`, `CORS_ORIGINS`: optional server configuration.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: optional image upload settings.

After editing `.env`, restart the dev server so Vite and any backend process can read the new values.

## Paystack, MongoDB, and Dashboard

### Useful Scripts

```bash
npm run seed:admin
npm run seed:catalog
npm run test:db
npm run test:paystack
```

- `seed:admin`: creates a development owner admin if one does not exist. Defaults to username `bisile` and email `studio@bisile.co.za`; set `SEED_ADMIN_PASSWORD` before production.
- `reset:admin-login`: updates or creates the owner admin with `RESET_ADMIN_CURRENT`, `RESET_ADMIN_USERNAME`, `RESET_ADMIN_EMAIL`, and `RESET_ADMIN_PASSWORD`.
- `seed:catalog`: seeds BISILE products, categories, shipping options, and default store settings into the `bisile` database.
- `test:db`: connects to MongoDB, creates/verifies required collections inside `bisile`, and performs a temporary write/delete probe.
- `test:paystack`: creates a standalone Paystack test transaction and prints the authorization URL/reference. It does not create a BISILE order.
- `migrate:cloudinary`: uploads active local images/videos to Cloudinary and writes `src/data/cloudinary-image-map.json`. Run only after confirming Cloudinary credentials and desired upload timing. Local files are not deleted.

### MongoDB Collections

Use a dedicated database named `bisile`. Do not point `MONGODB_DB_NAME`, `MONGODB_DB`, or `MONGODB_DATABASE` at other cluster databases.

- `users`: future customer/user accounts.
- `admins`: dashboard users. Passwords are hashed.
- `products`: fragrances, hair, wigs, bundles, closures, frontals, wig laundry services, candles, and discovery sets.
- `orders`: cart items, customer details, delivery info, payment status, and order status.
- `customers`: customer contact and delivery information.
- `payments`: Paystack references, status, amount, currency, transaction response, and verification details.
- `shippingOptions`: Pudo, The Courier Guy, Fastway, PostNet, and prices.
- `emailLogs`: order confirmations, test emails, and customer notifications.
- `uploads`: Cloudinary URLs for product images, videos, proof of payment, and customer reference images.
- `categories`: shop categories such as Fragrance, Hair, Wigs, Bundles, Closures & Frontals, Wig Laundry.
- `adminLogs` / `auditLogs`: admin login and dashboard actions.

### Checkout Security

- BISILE uses Paystack hosted checkout; card details are never entered into or stored by the BISILE site.
- The backend recalculates item totals from trusted product records and selected shipping.
- The frontend must not send price, subtotal, total, or amount fields.
- Orders are created as `pending`.
- Orders are marked paid only after Paystack verification or webhook confirmation.
- In production, use HTTPS and configure `CLIENT_URL` / `FRONTEND_URL` to the deployed frontend URL.

### Common Checkout Error

Error:

```text
Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

Cause: the frontend called a missing or incorrect API endpoint and received an empty/HTML/404 response instead of JSON. This happens locally when Vite is running without the Express API.

Fix: run `npm run dev:api` beside `npm run dev`. The frontend checks `response.ok`, reads raw response text before parsing JSON, and shows a useful error instead of throwing a JSON parse failure.

The production flow uses the Render Express API:

- `POST /api/payments/initialize`: recalculates trusted prices, creates a pending order, and opens Paystack Checkout.
- `GET /api/payments/verify/:reference`: verifies the returned Paystack reference.
- `POST /api/webhooks/paystack`: verifies Paystack signatures and processes payment, refund, transfer, and payment-request events.
- `POST /api/auth/login`: authenticates the dashboard owner/admin.

Create a real root `.env` file from `.env.example`. Restart the dev server after changing env values because Vite reads them at startup.

For backend-only local testing:

```bash
cd server
npm install
npm run dev
```

Use `server/.env.example` as the backend template.

## Frontend Hosting Plan

The final frontend host is DirectAdmin. Build the static frontend with:

```bash
npm run build
```

The output folder is:

```text
dist
```

Upload the contents inside `dist` to the DirectAdmin public folder, usually `public_html`. Do not upload the whole source project unless the host specifically requires it.

See `DIRECTADMIN_DEPLOYMENT.md` for the full DirectAdmin checklist.

## Render Hosting Plan

Render can host the API and the built Vite site from the same Web Service.

Render service type:

```text
Web Service
```

Suggested Render settings:

- Runtime: Node
- Root directory: leave blank
- Build command: `npm install && npm --prefix server install && npm run build && npm --prefix server run build`
- Start command: `npm --prefix server start`

Render provides `PORT` automatically. The backend also has:

```text
GET /api/health
```

The response should be:

```json
{ "status": "ok" }
```

When the frontend is served by the same Render service, leave `VITE_API_BASE_URL` blank so browser requests use `/api/*` on the same origin. When the frontend is hosted on DirectAdmin, set it to `https://bebisile.onrender.com`.

## DirectAdmin Deployment

1. Add the correct root `.env` values.
2. Run `npm install`.
3. Run `npm run build`.
4. Upload the contents inside `dist` to `public_html`.
5. Confirm `index.html` is directly inside `public_html`.
6. Keep the included `.htaccess` rewrite file for client-side routing.
7. Make sure `VITE_API_BASE_URL` points to the Render backend URL.
8. Test the live frontend.

## Render Deployment

1. Create a Render Web Service.
2. Leave root directory blank.
3. Set build command to `npm install && npm --prefix server install && npm run build && npm --prefix server run build`.
4. Set start command to `npm --prefix server start`.
5. Add backend env values from `server/.env.example`.
6. Set `FRONTEND_URL` and `CLIENT_URL` to `https://bisile.co.za`.
7. Visit `/api/health` after deployment.
8. Visit `/` and a nested route such as `/shop` to confirm the React app fallback is serving correctly.

`render.yaml` is included as an editable blueprint.

## Environment Variables

Real `.env` files are not committed. Public browser variables in Vite must start with `VITE_`. Secret backend values must never use `VITE_`.

Frontend root variables:

- `VITE_SITE_NAME`: public website name.
- `VITE_SITE_URL`: final frontend URL, `https://bisile.co.za`.
- `VITE_API_BASE_URL`: Render backend URL.
- `VITE_PAYSTACK_CHECKOUT_API_URL`: optional Paystack checkout endpoint override.
- `VITE_PAYSTACK_VERIFY_API_URL`: optional Paystack verification endpoint override.
- `VITE_WHATSAPP_NUMBER`: WhatsApp number for CTAs.
- `VITE_CONTACT_EMAIL`: public contact email.
- `VITE_INSTAGRAM_URL`: Instagram URL.
- `VITE_PINTEREST_URL`: Pinterest URL.
- `VITE_ENABLE_VIDEO_HERO`: enables desktop hover videos.

Backend/server-only variables:

- `NODE_ENV`, `PORT`: backend runtime settings.
- `FRONTEND_URL`: frontend URL allowed by CORS.
- `CLIENT_URL`: optional checkout redirect URL.
- `MONGODB_URI`, `MONGODB_DB`: MongoDB connection.
- `JWT_SECRET`: backend auth secret.
- `PAYSTACK_SECRET_KEY`: Paystack server secret.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: optional upload settings.

## Common Errors And Fixes

- Missing Vite env updates: restart `npm run dev`.
- DirectAdmin route refresh 404: confirm `.htaccess` is present in `public_html`.
- Render CORS error: set `FRONTEND_URL` and `CLIENT_URL` to the exact frontend origin and rebuild the frontend if `VITE_API_BASE_URL` changed.
- Backend JSON 404 after a code change: redeploy the Render service, then verify both `/api/health` and `/api/health/ready`; a stale deployment can still return HTML 404 pages for newer routes.
- Paystack webhook failing: confirm the webhook URL is `/api/webhooks/paystack` on Render and that `PAYSTACK_SECRET_KEY` matches the Paystack integration.
- Backend fails on Render startup: confirm MongoDB, Paystack, and JWT env values are present.
