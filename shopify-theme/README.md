# Gift Yalla — Shopify theme

Online Store 2.0 theme for a gifting store (flowers, cakes, gift sets…). No paid apps needed. English + Arabic (RTL), COD-ready, same-day delivery slots.

## Run it

```bash
git clone --branch claude/hopeful-franklin-f2acgv https://github.com/sanaderali/alanfaldoc.git
```

```bash
shopify theme dev --path alanfaldoc/shopify-theme --store gift-yalla-pskzuqz6.myshopify.com
```

To push it to a store as a normal theme: `shopify theme push --path alanfaldoc/shopify-theme`.

## Fill the store with dummy content

1. **Products**: admin → Products → Import → upload `seed/products.csv` (47 gifts, tagged by category/occasion, no images yet; the theme shows an emoji tile until you upload photos). Regenerate with `node seed/build-products-csv.mjs`.
2. **Collections** (tag-based, automatic): Option 1, create them by hand in Products → Collections → Create collection → *Automated*, with the condition `Product tag is equal to <tag>` (list in `seed/create-collections.mjs`). Option 2, run `node seed/create-collections.mjs` with an Admin API token (instructions at the top of that file).
3. **Navigation** (Content → Menus → *Main menu*), up to 3 levels shows as a mega menu:
   - Birthday · Gift Sets · Flowers · Cakes · Chocolates · Perfumes · Jewellery
   - Occasions → Anniversary, Love, Graduation, New Born, Get Well Soon, Wedding
   - Gifts → Gifts for Her, Gifts for Him, Personalised
   - Create a second menu with handle `footer` (Shipping, Returns, About, Contact…).
4. **Wishlist page**: Content → Pages → add page "Wishlist", Theme template = `page.wishlist`.
5. **Cash on delivery**: Settings → Payments → Manual payment methods → Cash on Delivery.
6. **Languages / countries**: Settings → Markets (add Arabic and your countries). The header gets a country + language switcher automatically.

## Delivery slots (no app)

Customers pick **city → day → time window** on the product page (and can change it in the cart). It is saved on the order as line-item properties: `City`, `Delivery date`, `Delivery slot`.

Edit everything in **Theme settings → Delivery**: cities, slots (24 h, one per line), how many hours before a slot it closes (default 2), booking days ahead, blocked dates, time-zone offset (Saudi = 3).

The cart page re-checks every slot before checkout and blocks it if a window has closed.
Limit to know: this check runs in the browser (Shopify Basic can't run checkout code). Use Shopify Flow (free) or manual review to catch the rare bypass.

## Brand

| Role | Colour | Hex |
|---|---|---|
| Primary (Grape) | buttons, links, logo | `#6C3BF5` |
| Accent (Coral) | sale, hearts, highlights | `#FF5C7A` |
| Highlight (Sunshine) | badges, CTAs on dark | `#FFC93C` |
| Text (Night plum) | text, footer | `#1E1233` |
| Background (Cream) | page | `#FFF8F1` |
| Soft (Lilac / Mint) | section backgrounds | `#F0E9FF` / `#DDF7EC` |

Tagline: **"Yalla, make their day."** Alternatives: "Gift fast. Gift bold." · "Send the vibe." · "Surprise someone. Yalla!"
Fonts: Plus Jakarta Sans (Latin), Cairo (Arabic). All colours can be changed in Theme settings → Brand colours.
Logo idea: bold rounded wordmark "Gift Yalla!" with a sunshine-yellow dot, optionally a ribbon bow forming the "Y". Upload it in Header section → Logo.

## Structure

`layout/` · `sections/` (home blocks + `main-*` page sections) · `snippets/` (product card, delivery picker, icons) · `assets/theme.css|js` · `config/` (settings) · `locales/` (en, ar) · `templates/` · `seed/` (dummy data, not pushed to Shopify).
