# Gift Yalla storefront (Next.js 16 + Shopify Storefront API)

Headless version of the Gift Yalla store. Shopify keeps products, orders, checkout and COD/Stripe. This app is only the fast front-end.

## Run

```bash
cd giftyalla-storefront
npm install
npm run dev
```

With no token it runs in **demo mode**: 47 dummy gifts, all pages work, the cart is disabled.

## Connect Shopify (free)

1. Shopify admin → Settings → Apps → Develop apps (or install the free **Headless** channel) → create a Storefront API token with `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_read_product_tags`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`.
2. Copy `.env.example` to `.env.local` and fill `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN`.
3. Import the dummy products and create the collections with the files in `../shopify-theme/seed/`.
4. Optional: add webhooks (products/update, collections/update) to `https://YOUR-SITE/api/revalidate` and set `SHOPIFY_WEBHOOK_SECRET`, so edits in Shopify show up in seconds.

## Why it is fast

- Cache Components: product and collection pages are prerendered (82 pages in the demo build) and served from cache. Only the cart and search results stream at request time.
- Almost no client JavaScript: navigation, mega menu, mobile menu, gallery and tab content are server-rendered. Only the delivery picker, product form, cart view and carousel arrows hydrate.
- `next/image` (AVIF/WebP, correct sizes, no layout shift) and `next/font` (self-hosted).
- The header cart count comes from a cookie, so it never waits on Shopify.

## Delivery slots

Rules live in `lib/config.ts` (cities, slots, cutoff hours, days ahead, blocked dates). The same `lib/delivery.ts` runs in the browser and on the server: the server re-checks every window when adding to cart and again at `/checkout`, so a closed slot cannot reach Shopify's checkout.

## Not built yet

Arabic/RTL, wishlist, customer accounts, filters beyond sorting. The CSS already uses logical properties, so RTL is straightforward to add.
