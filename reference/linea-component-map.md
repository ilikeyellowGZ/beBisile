# Linea Component Map

Source routes:

- `https://linea-jewelry.lovable.app/`
- `https://linea-jewelry.lovable.app/product/3`
- `https://linea-jewelry.lovable.app/category/shop`

Date analyzed: 2026-06-03

Note: the app is a compiled React single-page app. The served HTML is only an app shell; page structure and copy were extracted from the compiled JS bundle and CSS bundle. The full raw minified bundle is intentionally not copied here.

## Shared App Shell

### Header / Nav

Copy:

- `Shop`
- `New in`
- `About`
- Center logo image: `/LINEA-1.svg`

Layout:

- Sticky header.
- Left nav links.
- Centered logo.
- Right utility icons for search, wishlist, and bag/cart.
- White background.

Classes found around header:

- `w-full sticky top-0 z-50`
- nav component is nested in the header.

Colors:

- Background: `hsl(var(--nav-background))`, resolved `#ffffff`.
- Text: `hsl(var(--nav-foreground))`, resolved approximately `#333333`.

Typography:

- Body/nav font: `DM Sans, sans-serif`.
- Nav text appears small, light, and minimal.

Interactions:

- Cart and wishlist are React-state driven.
- Header remains sticky while scrolling.

## Home Page

Route: `/`

### Two-Column Feature Grid

Copy:

- `Organic Forms`
- `Nature-inspired pieces with fluid, sculptural details`
- `Chain Collection`
- `Refined links and connections in precious metals`

Assets:

- `/assets/earrings-collection-6O5tp3RC.png`
- `/assets/link-bracelet-CMFM2KKw.png`

Layout:

- `grid grid-cols-1 md:grid-cols-2 gap-6`
- Each card uses a square image block.
- Text sits below each image, left aligned.

Classes found:

- `w-full aspect-square mb-3 overflow-hidden`
- `w-full h-full object-cover hover:scale-105 transition-transform duration-300`
- `text-sm font-normal text-foreground mb-1`
- `text-sm font-light text-foreground`

Interactions:

- Image scales up on hover: `hover:scale-105`.
- Transition duration: `duration-300`.

### Product Row

Copy/product data visible:

- `Pantheon` / `€2,850` / `Earrings`
- `Eclipse` / `€3,200` / `Bracelets`
- `Halo` / `€1,950` / `Earrings`
- `Oblique` / `€1,650` / `Earrings`

Assets:

- `/assets/pantheon-ChbEbbTu.jpg`
- `/assets/eclipse-ErA5xE4T.jpg`
- `/assets/halo-CMlMG7vQ.jpg`
- `/assets/oblique-BrLAWbgb.jpg`

Layout:

- Product cards on a white page.
- Four-column grid on desktop.
- Image tile above category/name/price.

### Wide Editorial Image

Copy:

- `Modern Heritage`
- `Contemporary jewelry crafted with timeless elegance`

Asset:

- `/assets/hero-image-Biu-8NYF.png` or related wide editorial imagery from bundle.

Layout:

- Full-width image band.
- Caption below, left aligned.

### Secondary Editorial Pair

Copy:

- `Artisan Craft`
- `Handcrafted pieces with meticulous attention to detail`
- `Circular Elements`
- `Geometric perfection meets contemporary minimalism`

Assets:

- `/assets/organic-earring-BV1LtJhH.png`
- `/assets/circular-collection-B1hP9RgJ.png`

Layout:

- Two image/text cards with strong white space.

### Story Teaser

Copy:

- `Jewelry Drawn From Shadows and Lines`
- `Linea was born from the meeting of two minds who saw beauty not just in extension of space, light, and line.`
- `Read our full story`

Assets:

- `/assets/shadowline-DPSA61jB.jpg`
- `/assets/founders-ioSVwXFB.png` or `/founders.png`

Layout:

- Large white-space composition.
- Text block on one side, image block on the other.

## Product Detail Page

Route: `/product/3`

Confirmed product for `/product/3`:

- `Halo`
- `€1,950`
- Category: `Earrings`
- Asset: `/assets/halo-CMlMG7vQ.jpg`

Related product/cart data found in bundle:

- `Pantheon`, `€2,850`, `Earrings`
- `Eclipse`, `€3,200`, `Bracelets`
- `Halo`, `€1,950`, `Earrings`

Cart/checkout copy found:

- `Proceed to Checkout`
- `Continue Shopping`

Layout inference from bundle and route behavior:

- Product image gallery/details page.
- Add-to-cart quantity state exists.
- Checkout link routes to `/checkout`.

Interactions:

- Quantity state updates via React.
- Cart total is derived from item quantities.
- Product and cart data are client-side in the compiled app.

## Category Shop Page

Route: `/category/shop`

### Category Header

Copy:

- Breadcrumb/page context includes `Home`
- Page title includes `Necklaces`
- `24 items`
- `Filters`
- Sort label includes `Featured`

Layout:

- Header area with breadcrumb and category title.
- Item count left.
- Filters and sort controls right.
- Bottom border divider.

Classes found:

- `w-full px-6 mb-8 border-b border-border pb-4`
- `flex justify-between items-center`
- `text-sm font-light text-muted-foreground`
- `flex items-center gap-4`

### Filter Drawer / Sheet

Copy:

- `Filters`
- `Category`
- `Earrings`
- `Bracelets`
- `Rings`
- `Necklaces`
- `Price`
- `Under €1,000`
- `€1,000 - €2,000`
- `€2,000 - €3,000`
- `Over €3,000`
- `Material`
- `Gold`
- `Silver`
- `Rose Gold`
- `Platinum`

Layout:

- Right-side filter panel over darkened page overlay.
- White drawer body.
- Close button in top-right.
- Filter groups separated by horizontal borders.

Interactions:

- Filter drawer open/close controlled by React state.
- Checkboxes or checkbox-like square controls for filter values.

## Footer

Copy:

- `Linea Jewelry Inc.`
- `Minimalist jewelry crafted for the modern individual`
- `Visit Us`
- `123 Madison Avenue`
- `New York, NY 10016`
- `Contact`
- Shop column: `New In`, `Rings`, `Earrings`, `Bracelets`, `Necklaces`
- Support column: `Size Guide`, `Care Instructions`, `Returns`, `Shipping`, `Contact`
- Connect column: `Instagram`, `Pinterest`, `Newsletter`

Asset:

- `/Linea_Jewelry_Inc-2.svg`

Layout:

- White footer with top border.
- Main grid: `grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8`
- Sub-columns for Shop, Support, Connect.
- Large top margin from preceding content: `mt-48`.

Colors:

- Background: `#ffffff`
- Border: `#e5e5e5`
- Text: black with opacity for muted details.

## Implementation Notes For Bisile

Use the Linea reference as a style direction, not as copied source code:

- White background with very restrained borders.
- Sticky minimal nav.
- Product cards: square image, hover scale, small sans captions.
- Editorial spacing: large top/bottom whitespace and simple two-column grids.
- Category pages: breadcrumb, large page title, item count, filter/sort row.
- Footer: white, bordered, multi-column, not dark.
