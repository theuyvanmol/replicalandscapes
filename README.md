# Replica Landscapes — Next.js + Shopify

A portable export of the approved Replica Landscapes design, including the transparent tree wordmark, photography, recreated commercial images, marketing pages and animations. Commerce uses Next.js App Router, TypeScript, the Shopify Storefront API and Shopify-hosted checkout.

## Recommended architecture

**GitHub** stores your source → **Vercel** builds and hosts Next.js → **Shopify** manages products, variants, prices, inventory, payments, orders, shipping and taxes. Customers browse your custom site and pay through Shopify's secure checkout. Shopify is the product back office; it does not automatically become an editor for the custom marketing pages.

## Start locally

1. Install Node.js 22 LTS or newer.
2. Open this folder in your terminal.
3. Run `npm ci`.
4. Copy `.env.example` to `.env.local`.
5. Run `npm run dev` and open http://localhost:3000.

Without Shopify credentials, the site runs in a clearly labelled sample-catalogue mode. Checkout is disabled. Do not treat archived prices as current selling prices.

## Connect Shopify

1. Create or select the client's Shopify store and configure its currency, taxes, shipping zones, payment provider and policies.
2. Install Shopify's **Headless** sales channel. Create a storefront and obtain its **public Storefront API access token**. This project uses the `X-Shopify-Storefront-Access-Token` header. Do not put a Shopify Admin API token here.
3. Enable product/listing access and cart/checkout access appropriate to your Storefront token. Publish the products to the Headless channel, with active products and purchasable variants.
4. Set `SHOPIFY_STORE_DOMAIN` to `your-store.myshopify.com` (no protocol or slash) and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` to the token. The pinned API target is `2026-10`; review Shopify's version support periodically.
5. Import and verify the client's catalogue **inside Shopify**. The bundled snapshot is partial supplementary data, not a full primary-source import. Confirm descriptions, photos, stock, prices, VAT, SKUs, product types and all size/colour variants before launch.
6. Test a full Shopify test-mode purchase, including option selection, quantity changes, shipping, taxes, failed payments, stock changes and order notifications. Turn off test mode only when the client is ready.

Products and product types are read live from Shopify; no embedded Shopify keys are sent to the browser. Basket IDs are stored in an HTTP-only cookie. Purchase actions use Shopify variant IDs and current Shopify prices. The app deliberately fails visibly on connection errors rather than substituting old sample data.

## GitHub → Vercel

1. Create an empty private GitHub repository.
2. Upload the **contents of this folder**, including hidden configuration files; do not upload the ZIP itself, `node_modules`, `.next` or `.env.local`.
3. Import the repository into Vercel. Framework preset: **Next.js**. Root: this project folder. Build command: `npm run build`. Leave output directory at the Next.js default.
4. Add the variables from `.env.example` in Vercel. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS custom domain. Use a separate test Shopify store for preview deployments when possible.
5. Deploy, add the custom domain and complete the Shopify test purchase on that domain. Vercel redeploys automatically when you push to GitHub.
6. Set `ALLOW_INDEXING=true` only after the catalogue, domain, legal pages and checkout are approved. Vercel Preview deployments remain noindex. Redeploy after changing environment variables.

No special `vercel.json`, static export or separate server is required. Do not use `output: 'export'`: Shopify cart actions need the Next.js server runtime.

## Included

- `/`: approved image-led homepage, scroll scenes, collection cards and comparison section.
- `/our-story`: brand, services and maintenance story.
- `/bespoke-commercial`: immersive hospitality, office and large oak installation page.
- `/shop`: searchable, sortable catalogue with product-type filters and pagination.
- `/products/[handle]`: server-rendered product detail, gallery, Shopify variants and quantities.
- `/cart`: Shopify basket, quantity updates/removal and hosted-checkout handoff.
- Page metadata, canonical URLs, robots, sitemap and live Product/Offer structured data.
- Responsive layouts, reduced-motion handling, loading/error boundaries and local visual assets.

## Code organisation

- `app/`: native Next.js routes, metadata and server actions.
- `components/`: commerce components and marketing renderer.
- `lib/shopify.ts`: server-only GraphQL client, catalogue and cart queries.
- `content/*.html`: editable server-rendered marketing content, retained to preserve the approved design.
- `public/design/`: original presentation CSS and isolated motion scripts. `commerce-bridge.js` routes the old marketing hotspots to the new shop. Legacy purchase dialogs are inert; all live purchasing uses the native Next.js pages.
- `public/assets/`: bundled brand and photographic assets.
- `lib/demo.json`: archived partial catalogue, used only when Shopify is not configured.

Marketing pages deliberately use normal document navigation because their retained animations initialise on page load. Commerce is implemented in React. This is a practical migration, not a claim that every original design script has been rewritten as React components.

## Editing and limits

- Products, variants, prices and stock: edit in Shopify.
- Homepage copy, story, commercial text and section layouts: edit `content/` in GitHub. A visual CMS or Shopify metaobject-driven section editor is a separate next step, **not included**.
- Main marketing mega-menu: edit `public/design/shop-menu.js`. Product types must match the Shopify catalogue; adjust its labels/links when importing. Commerce uses a simpler responsive navigation.
- Existing source photography and recreated project visuals are bundled. Recreated images must not be presented as untouched project photography. Keep their existing labels.
- No customer-account portal, saved wishlists, AI stylist, review service, email marketing or automated full-catalogue migration is included.
- Catalogue loading currently pages through up to 5,000 products server-side and sends the listing to the client for filtering. Each product query includes up to 100 variants and 12 images. For larger catalogues/variant sets, move to collection-based cursor pagination and paginated variant queries before launch.
- Requests are uncached for correctness. Add a tested Shopify webhook/cache layer if traffic or catalogue size warrants it.
- Source image data and prices were supplied for design use and may be out of date. Confirm rights and final product accuracy with the owner.
- Add approved returns, privacy, delivery and terms pages before accepting orders.

## Checks

`npm run typecheck` and `npm run build` are the baseline checks. The GitHub Actions workflow runs both on pushes and pull requests. Credentials are not needed for a sample-mode build. Live Shopify checkout cannot be verified without the client's store configuration.

## Official references

- Next.js installation: https://nextjs.org/docs/app/getting-started/installation
- Vercel Next.js deployment: https://vercel.com/docs/frameworks/full-stack/nextjs
- Shopify Headless channel: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api
- Shopify cart and checkout: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage

Original design source revision: 784389a57d51b60ae7d313c920790327ff33663d.
