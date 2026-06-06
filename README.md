# BISILE | Be Luxury

Luxury React storefront for BISILE fragrance, processed virgin hair, wig laundry services, pamper packages, cart, checkout, dashboard, and customer support.

## Project Overview

- Frontend: Vite, React, TypeScript, Tailwind-style utility classes.
- Temporary preview host: Netlify.
- Final frontend host: DirectAdmin static hosting.
- Final backend host: Render Web Service.
- Backend: Express/Mongoose API in `server/`.
- Temporary serverless checkout/admin flow: Netlify Functions in `netlify/functions/`.

## Local Development

```bash
npm install
npm run dev
```

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

## Backend Hosting Plan

The final backend host is Render.

Render service type:

```text
Web Service
```

Suggested Render settings:

- Runtime: Node
- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`

Render provides `PORT` automatically. The backend also has:

```text
GET /api/health
```

The response should be:

```json
{ "status": "ok" }
```

Use the Render URL as `VITE_API_BASE_URL` in the frontend.

## Temporary Netlify Preview

Netlify is temporary for previews/testing. `netlify.toml` keeps the Vite defaults:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Client-side route redirect to `index.html`

Do not make Netlify-only behavior required for the final DirectAdmin production site.

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
2. Set root directory to `server`.
3. Set build command to `npm install && npm run build`.
4. Set start command to `npm start`.
5. Add backend env values from `server/.env.example`.
6. Set `FRONTEND_URL` to the final DirectAdmin frontend URL when known.
7. Set `TEMP_NETLIFY_URL` while Netlify preview is still being used.
8. Visit `/api/health` after deployment.

`render.yaml` is included as an editable blueprint.

## Environment Variables

Real `.env` files are not committed. Public browser variables in Vite must start with `VITE_`. Secret backend values must never use `VITE_`.

Frontend root variables:

- `VITE_SITE_NAME`: public website name.
- `VITE_SITE_URL`: final frontend URL, temporarily Netlify if needed.
- `VITE_API_BASE_URL`: Render backend URL.
- `VITE_CHECKOUT_API_URL`: optional checkout endpoint override.
- `VITE_WHATSAPP_NUMBER`: WhatsApp number for CTAs.
- `VITE_CONTACT_EMAIL`: public contact email.
- `VITE_INSTAGRAM_URL`: Instagram URL.
- `VITE_PINTEREST_URL`: Pinterest URL.
- `VITE_ENABLE_VIDEO_HERO`: enables desktop hover videos.
- `VITE_STRIPE_PUBLISHABLE_KEY`: optional public Stripe publishable key only.

Backend/server-only variables:

- `NODE_ENV`, `PORT`: backend runtime settings.
- `FRONTEND_URL`: frontend URL allowed by CORS.
- `TEMP_NETLIFY_URL`: temporary Netlify preview URL allowed by CORS.
- `CLIENT_URL`: optional legacy checkout redirect URL.
- `MONGODB_URI`, `MONGODB_DB`: MongoDB connection.
- `JWT_SECRET`: backend auth secret.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Stripe server secrets.
- `RESEND_API_KEY`, `SENDGRID_API_KEY`, `FROM_EMAIL`: optional email settings.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: optional upload settings.

## Common Errors And Fixes

- Missing Vite env updates: restart `npm run dev`.
- DirectAdmin route refresh 404: confirm `.htaccess` is present in `public_html`.
- Render CORS error: set `FRONTEND_URL` to the exact frontend origin and add `TEMP_NETLIFY_URL` for preview.
- Checkout still calls Netlify: set `VITE_API_BASE_URL` or `VITE_CHECKOUT_API_URL`, then rebuild.
- Stripe webhook failing: use the webhook signing secret from the exact deployed endpoint.
- Backend fails on Render startup: confirm MongoDB, Stripe, and JWT env values are present.
