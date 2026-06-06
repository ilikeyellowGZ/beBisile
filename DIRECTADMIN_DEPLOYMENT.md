# DirectAdmin Frontend Deployment

The final BISILE frontend host is DirectAdmin. Netlify is only temporary for preview/testing.

## Build Locally

1. Run `npm install`.
2. Create the real root `.env` file from `.env.example`.
3. Set `VITE_SITE_URL` to the final DirectAdmin domain when it is known.
4. Set `VITE_API_BASE_URL` to the Render backend URL, for example `https://your-service-name.onrender.com`.
5. Run `npm run build`.

Vite creates the static site in:

```text
dist
```

## Upload to DirectAdmin

Upload the contents inside the `dist` folder to the DirectAdmin website public folder, usually:

```text
public_html
```

Do not upload the whole project source unless your hosting provider specifically requires it. `index.html` should be directly inside `public_html`.

## React Router Refresh Fix

This project uses client-side routing. On Apache/DirectAdmin, page refreshes need a rewrite rule so routes like `/#/shop` or future browser routes do not 404.

The repo includes `public/.htaccess`, which Vite copies into `dist`.

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## After Upload

1. Visit the live frontend.
2. Check the navbar, hero, shop, product pages, cart, checkout, dashboard route, and contact page.
3. Confirm the frontend API URL points to the Render backend URL through `VITE_API_BASE_URL`.
4. Test the Render health route in the browser:

```text
https://your-service-name.onrender.com/api/health
```

5. If `.env` values change, rebuild with `npm run build` and upload the new `dist` contents again.
