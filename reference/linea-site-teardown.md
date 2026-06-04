# Site Teardown: Linea Jewelry

URL:

- `https://linea-jewelry.lovable.app/`
- `https://linea-jewelry.lovable.app/product/3`
- `https://linea-jewelry.lovable.app/category/shop`

Date analyzed: 2026-06-03

## Execution Notes

The requested `site-teardown` workflow was executed using the local `.agent/skills/site-teardown/SKILL.md` guidance. The referenced `gsd` skill file was not present in this repo, and `exampleImgs/` was not present, so visual audit could not be written from local images.

I did not copy the full raw minified JS/CSS bundle into this project. The app bundle is third-party code and over 500 KB minified. Instead, this teardown records the exact source-derived design system, assets, page structure, visible copy, and implementation guidance needed to recreate the look.

## Tech Stack Confirmed From Source

| Technology | Evidence | Purpose |
|---|---|---|
| Vite | HTML includes `/assets/index-Cdq_KXhv.js` and `/assets/index-UVLv3reW.css` | Frontend bundling |
| React | Compiled JS contains React-style JSX runtime output and stateful route components | SPA UI |
| Tailwind-style utilities | CSS contains compiled utility classes such as `grid`, `px-6`, `md:grid-cols-2`, `hover:scale-105` | Layout and styling |
| React Router-style routing | Routes return same SPA shell; bundle contains page paths and route-specific copy | Client-side routing |
| CSS transitions | Classes and variables include `transition-transform`, `duration-300`, `--transition-smooth` | Hover and UI motion |

## Requested Routes

All three requested URLs return the same 2,151-byte HTML shell:

- `/product/3`
- `/`
- `/category/shop`

The actual page code lives in:

- JS bundle: `/assets/index-Cdq_KXhv.js`
- CSS bundle: `/assets/index-UVLv3reW.css`

## Design System Summary

Detailed tokens are saved in:

- `reference/linea-design-system.json`

Core visual language:

- White page background.
- Near-black foreground text.
- Very light gray surfaces and borders.
- Minimal `DM Sans` typography.
- Small labels and body text.
- Large but simple page headings.
- Product images in square or wide editorial crops.
- Sparse borders instead of shadows.

Core resolved colors:

- Background: `#ffffff`
- Foreground: `#171717`
- Muted surface: `#f5f5f5`
- Muted text: `#737373`
- Border: `#e5e5e5`

Breakpoints found:

- `640px`
- `768px`
- `1024px`
- `1400px`

## Effects Breakdown

| Effect | Implementation | Complexity | Cloneable |
|---|---|---|---|
| Product image hover | `hover:scale-105 transition-transform duration-300` | Low | Yes |
| Sticky nav | Header uses sticky positioning with high z-index | Low | Yes |
| Filter drawer | React state opens a right-side panel over an overlay | Medium | Yes |
| Cart state | Client-side React state tracks quantities and totals | Medium | Yes |
| Product cards | Static product data rendered into responsive grids | Low | Yes |

No GSAP usage was found in the source evidence. The Linea feel comes mostly from restrained layout, photography, typography, and CSS transitions.

## Page Build Plan

### Shared Layout

- Sticky white nav.
- Left links: `Shop`, `New in`, `About`.
- Center logo.
- Right icons: search, wishlist, cart.
- White footer with top border and multi-column links.

### Home Page

Build sections in this order:

1. Two-card feature grid:
   - `Organic Forms`
   - `Chain Collection`
2. Product row:
   - `Pantheon`
   - `Eclipse`
   - `Halo`
   - `Oblique`
3. Wide editorial image:
   - `Modern Heritage`
4. Two editorial cards:
   - `Artisan Craft`
   - `Circular Elements`
5. Story teaser:
   - `Jewelry Drawn From Shadows and Lines`
6. Footer.

### Product Detail Page

For `/product/3`, confirmed product:

- Name: `Halo`
- Price: `€1,950`
- Category: `Earrings`
- Image: `/assets/halo-CMlMG7vQ.jpg`

Recommended structure:

- Sticky nav.
- Product image/gallery.
- Product information column.
- Quantity/cart control.
- Continue/proceed checkout actions.

### Category Shop Page

Build sections in this order:

1. Breadcrumb/title block:
   - `Home`
   - `Necklaces`
2. Toolbar:
   - `24 items`
   - `Filters`
   - `Featured`
3. Product grid.
4. Filter drawer:
   - Category group.
   - Price group.
   - Material group.

## Assets Needed

Confirmed asset paths are included in:

- `reference/linea-design-system.json`

For Bisile, use the already imported Bisile imagery instead of copying Linea images. Match the image behavior and layout:

- Square product cards.
- Wide editorial crop.
- Hover scale.
- White breathing room.

## Notes For Bisile Implementation

Use this teardown as a visual and structural reference:

- Keep Bisile's original logo and content.
- Avoid dark page backgrounds.
- Use the Linea-style footer only in spirit: white, bordered, clean columns.
- Category pages should have a simple title row, count, filter/sort controls, and a drawer.
- Product cards should be quiet: image first, tiny category/name/price, no heavy ornament.

## Limitations

- `exampleImgs/` did not exist in the repo, so no local visual-audit file could be generated from images.
- The `gsd` skill file referenced in the pasted instructions did not exist.
- The source site is a compiled/minified SPA; exact author-level source files are not publicly exposed, only the built JS/CSS bundles.
- Full raw bundle copying was intentionally skipped. The useful extracted facts are captured in the companion files.
