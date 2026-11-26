# Cloudflare deployment

BISILE uses two Cloudflare services:

- **Storefront:** a Git-connected Worker serving the Vite build as static assets.
- **API:** currently served by Render, with a planned Cloudflare Container built from `server/Dockerfile`.

## Storefront Worker

The Workers build connected to this repository should use the repository root, `main` as its production branch, `npm run build` as its build command, and `npx wrangler deploy` as its deploy command. The included `wrangler.toml` points to `dist` and serves `index.html` for client-side routes such as `/shop` and `/admin`.

The public production values in `.env.production` are read by Vite at build time. API requests use the storefront's `/api/*` path. The Worker forwards them to `API_UPSTREAM_URL` in `wrangler.toml`, which currently points to the live Render API. Change it when the Cloudflare Container is ready. This same-origin route avoids needing to add a temporary `workers.dev` origin to the API's CORS list. Backend secrets must stay in the API environment, never in a `VITE_` variable.

`npm run build` omits files over Cloudflare's 25 MiB asset limit when they have a Cloudinary URL in `src/data/cloudinary-image-map.json`. It fails if an oversized file has no mapping. Keep mapped Cloudinary assets available because the app loads them directly.

For a local deployment:

```text
npm ci
npm run check
npx wrangler deploy
```

The existing `bisile-storefront.pages.dev` project was created by Direct Upload and is separate from the Git-connected Worker. Git pushes update the Worker. If a custom domain is currently attached to Pages, attach it to the Worker in Cloudflare before using the Worker as the production storefront.

## API Container

Create a Cloudflare Container from `server/` using `server/Dockerfile`, then attach the custom hostname `api.bisile.co.za`. The container listens on port `5000`.

Set the variables and secrets from `server/.env.example` in the Cloudflare dashboard. Required secrets include `MONGODB_URI`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, and `RESEND_API_KEY`. Set `FRONTEND_URL` and `CLIENT_URL` to the storefront's final origin, and include that origin in `CORS_ORIGINS`.

After deployment, verify `https://api.bisile.co.za/api/health` and `https://api.bisile.co.za/api/health/ready`. Update the Paystack webhook URL to `https://api.bisile.co.za/api/webhooks/paystack`.
