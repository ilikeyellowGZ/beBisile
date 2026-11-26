# Cloudflare deployment

BISILE runs as two Cloudflare services:

- **Frontend:** Cloudflare Pages, built from the repository root with `npm ci && npm run build`, output directory `dist`.
- **Backend:** Cloudflare Container, built from `server/Dockerfile`. The public API hostname is `https://api.bisile.co.za`.

## Frontend (Pages)

Create a Pages project connected to this repository with:

- Build command: `npm ci && npm run build`
- Build output directory: `dist`
- Production variable: `VITE_API_BASE_URL=https://api.bisile.co.za`
- Production variable: `VITE_SITE_URL=https://bisile.co.za`

The included `wrangler.toml` also supports `npx wrangler pages deploy dist` after a local build. Add a Pages SPA fallback so routes such as `/admin` serve `index.html`.

## Backend (Cloudflare Container)

Create a Cloudflare Container from `server/` using `server/Dockerfile`, then attach the custom hostname `api.bisile.co.za`. The container listens on port `5000`.

Set the variables and secrets from `server/.env.example` in the Cloudflare dashboard. Required secrets include `MONGODB_URI`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, and `RESEND_API_KEY`. Set `FRONTEND_URL` and `CLIENT_URL` to `https://bisile.co.za`, and set `CORS_ORIGINS` to `https://bisile.co.za,https://www.bisile.co.za`.

After deployment, verify:

```text
https://api.bisile.co.za/api/health
https://api.bisile.co.za/api/health/ready
```

Update the Paystack webhook URL to `https://api.bisile.co.za/api/webhooks/paystack`.

Do not place backend secrets in Pages variables or any `VITE_` variable.
