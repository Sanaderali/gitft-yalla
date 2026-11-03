// Generates seed/products.csv (Shopify product import format) with dummy gifts.
// Run:  node seed/build-products-csv.mjs
// Then: Shopify admin > Products > Import > upload products.csv
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// [title, price, category tag, extra tags, variants?]  variants = [optionName, [[value, priceDelta], ...]]
const SIZE = ['Size', [['Standard', 0], ['Premium', 80]]];
const CAKE = ['Size', [['500 g', 0], ['1 kg', 90]]];
const PCS = ['Pieces', [['12 pcs', 0], ['24 pcs', 70]]];
const VOL = ['Volume', [['50 ml', 0], ['100 ml', 110]]];

const P = [
  // flowers
  ['Blush Bloom Pink Bouquet', 195, 'flowers', 'same-day best-seller birthday love for-her', SIZE],
  ['Sweet Darling 100 Red Roses', 799, 'flowers', 'same-day best-seller love anniversary for-her'],
  ['White Lily Gift Bouquet', 259, 'flowers', 'same-day get-well-soon anniversary', SIZE],
  ['Painted Skies Tulip Vase', 289, 'flowers', 'same-day new birthday for-her'],
  ['Garden Grace Flower Bowl', 179, 'flowers', 'morning birthday get-well-soon'],
  ['Sunshine Gerbera Box', 229, 'flowers', 'same-day graduation birthday'],
  ['Pastel Peony Bouquet', 349, 'flowers', 'same-day new wedding anniversary for-her', SIZE],
  ['Little Joy Baby Bouquet', 219, 'flowers', 'same-day new-born'],
  ['Lavender Dreams Bouquet', 239, 'flowers', 'morning love anniversary for-her'],
  // cakes
  ['Dreamy Chocolate Drip Cake', 249, 'cakes', 'same-day best-seller birthday', CAKE],
  ['Red Velvet Heart Cake', 229, 'cakes', 'same-day love anniversary', CAKE],
  ['Strawberry Cloud Cake', 219, 'cakes', 'morning birthday get-well-soon', CAKE],
  ['Biscoff Crunch Cake', 259, 'cakes', 'same-day new birthday', CAKE],
  ['Dino Roar Kids Cake', 289, 'cakes', 'same-day kids birthday'],
  ['Bunny Buddy Kids Cake', 289, 'cakes', 'same-day kids birthday'],
  ['Starlight Princess Kids Cake', 299, 'cakes', 'same-day kids birthday'],
  ['Graduation Cap Cake', 269, 'cakes', 'same-day graduation', CAKE],
  ['Sweet Treats Cake Jars (6)', 129, 'cakes', 'same-day new birthday get-well-soon'],
  // chocolates
  ['Belgian Truffle Gift Box', 149, 'chocolates', 'same-day best-seller love', PCS],
  ['Dates & Chocolate Tray', 189, 'chocolates', 'same-day get-well-soon wedding'],
  ['Pistachio Luxe Hamper', 219, 'chocolates', 'same-day new anniversary'],
  ['Choco Bouquet', 139, 'chocolates', 'same-day graduation love for-her'],
  // flowers + chocolates
  ['Roses & Truffles Combo', 349, 'flowers', 'same-day best-seller flowers-chocolates chocolates love anniversary for-her'],
  ['Tulips & Pralines Box', 329, 'flowers', 'same-day flowers-chocolates chocolates birthday for-her'],
  ['Peach Blooms & Chocolates', 299, 'flowers', 'morning new flowers-chocolates chocolates get-well-soon'],
  ['Sunflower & Belgian Chocolate', 279, 'flowers', 'same-day flowers-chocolates chocolates graduation'],
  // gift sets
  ['The Self-Care Hamper', 299, 'gift-sets', 'same-day best-seller for-her birthday'],
  ["The Gentleman's Treat Box", 329, 'gift-sets', 'same-day for-him birthday anniversary'],
  ['Baby Welcome Basket', 359, 'gift-sets', 'same-day new-born'],
  ['Movie Night Surprise Box', 199, 'gift-sets', 'same-day new for-him for-her birthday'],
  ['Just Because Box', 169, 'gift-sets', 'same-day love for-her'],
  ['Gold Rose Forever Box', 389, 'gift-sets', 'same-day best-seller love anniversary for-her'],
  // perfumes
  ['Midnight Oud Eau de Parfum', 429, 'perfumes', 'same-day best-seller for-him birthday', VOL],
  ['Rose Petal Eau de Parfum', 399, 'perfumes', 'same-day for-her anniversary', VOL],
  ['Citrus Splash Body Mist Set', 159, 'perfumes', 'same-day new for-her graduation'],
  // jewellery
  ['Initial Gold Pendant', 249, 'jewellery', 'same-day best-seller personalised for-her love'],
  ['Pearl Drop Earrings', 199, 'jewellery', 'same-day for-her anniversary'],
  ['Silver Bracelet Duo', 179, 'jewellery', 'same-day for-her birthday'],
  ['Classic Watch Gift Set', 499, 'jewellery', 'same-day for-him graduation'],
  // balloons
  ['Birthday Balloon Bouquet', 99, 'balloons', 'same-day birthday'],
  ['Heart Foil Balloon Set', 79, 'balloons', 'same-day love anniversary'],
  ['Congrats Balloon Box', 129, 'balloons', 'same-day new graduation'],
  // personalised
  ['Custom Name Mug', 89, 'personalised', 'same-day for-him for-her birthday'],
  ['Photo Frame with Message', 119, 'personalised', 'same-day anniversary love'],
  ['Engraved Wooden Keepsake Box', 149, 'personalised', 'same-day new wedding anniversary'],
  // add-ons (shown as tick-boxes on the product page)
  ['Greeting Card Set', 15, 'add-ons', 'same-day'],
  ['Mini Balloon Pack', 25, 'add-ons', 'same-day'],
  ['Cuddly Teddy (Small)', 45, 'add-ons', 'same-day'],
  ['Mini Chocolate Box', 35, 'add-ons', 'same-day'],
  ['Premium Gift Wrap', 20, 'add-ons', 'same-day']
];

// Which cities sell what. No entry = sold in every city. Tags become city-<slug> (e.g. city-jeddah).
const CITY = {
  'Sweet Darling 100 Red Roses': ['jeddah', 'riyadh'],
  'Pastel Peony Bouquet': ['riyadh', 'jeddah', 'dammam'],
  'Sunshine Gerbera Box': ['mecca', 'madinah'],
  'Sunflower & Belgian Chocolate': ['mecca', 'madinah'],
  'Dino Roar Kids Cake': ['riyadh', 'jeddah'],
  'Bunny Buddy Kids Cake': ['riyadh', 'jeddah']
};
const header = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text', 'Status'];
const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const slug = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const typeOf = { flowers: 'Flowers', cakes: 'Cakes', chocolates: 'Chocolates', 'gift-sets': 'Gift Sets', perfumes: 'Perfumes', jewellery: 'Jewellery', balloons: 'Balloons', personalised: 'Personalised', 'add-ons': 'Add-ons' };

// Dummy images: branded placeholders (replace later in Shopify admin). Two per product so the gallery can be tested.
const TONE = { flowers: ['FFE5EA', 'C2185B'], cakes: ['FFF0C7', '8A5A00'], chocolates: ['EADCCF', '5D3A1A'], 'gift-sets': ['F0E9FF', '6C3BF5'], perfumes: ['DDF7EC', '0B6B4A'], jewellery: ['FFF0C7', '6C3BF5'], balloons: ['FFE5EA', '6C3BF5'], personalised: ['F0E9FF', 'FF5C7A'], 'add-ons': ['DDF7EC', '6C3BF5'] };
const img = (cat, title, n) => {
  const [bg, fg] = n === 1 ? TONE[cat] : [TONE[cat][1], 'FFFFFF'];
  return `https://placehold.co/800x1000/${bg}/${fg}.png?text=${encodeURIComponent(title).replace(/%20/g, '+')}`;
};
const rows = [header.map(esc).join(',')];
P.forEach(([title, price, cat, extra, variants], i) => {
  const handle = slug(title);
  const tags = [cat, ...extra.split(' '), ...(CITY[title] || []).map((c) => `city-${c}`)].filter(Boolean).join(', ');
  const body = `<p>${title}. A beautiful dummy product, replace this text, photos and price with your own.</p><ul><li>Hand-wrapped and delivered fresh</li><li>Free gift card message</li><li>Same-day delivery in selected cities</li></ul>`;
  const sku = `GY-${String(i + 1).padStart(3, '0')}`;
  const list = variants ? variants[1] : [['Default Title', 0]];
  const optName = variants ? variants[0] : 'Title';
  list.forEach(([val, delta], vi) => {
    const first = vi === 0;
    rows.push([
      handle, first ? title : '', first ? body : '', first ? 'Gift Yalla' : '', first ? typeOf[cat] : '', first ? tags : '', first ? 'TRUE' : '',
      first ? optName : '', val, `${sku}-${vi + 1}`, 500, '', 'continue', 'manual', price + delta, '', 'TRUE', 'TRUE',
      first ? img(cat, title, 1) : '', first ? 1 : '', first ? title : '', first ? 'active' : ''
    ].map(esc).join(','));
  });
  // second gallery image on its own row (only Handle + image columns are read)
  const blank = header.map(() => '');
  blank[0] = handle; blank[header.indexOf('Image Src')] = img(cat, title, 2); blank[header.indexOf('Image Position')] = 2; blank[header.indexOf('Image Alt Text')] = `${title} (detail)`;
  rows.push(blank.map(esc).join(','));
});

writeFileSync(join(here, 'products.csv'), rows.join('\n') + '\n');
console.log(`products.csv written: ${P.length} products, ${rows.length - 1} rows`);

// Collections reference (Shopify's own importer only handles products; create these as AUTOMATED collections,
// or run create-collections.mjs to make them all in one go).
const COLS = [
  ['Birthday', 'birthday', 'birthday'], ['Anniversary', 'anniversary', 'anniversary'], ['Love', 'love', 'love'], ['Graduation', 'graduation', 'graduation'],
  ['New Born', 'new-born', 'new-born'], ['Get Well Soon', 'get-well-soon', 'get-well-soon'], ['Wedding', 'wedding', 'wedding'],
  ['Flowers', 'flowers', 'flowers'], ['Cakes', 'cakes', 'cakes'], ['Chocolates', 'chocolates', 'chocolates'], ['Gift Sets', 'gift-sets', 'gift-sets'],
  ['Perfumes', 'perfumes', 'perfumes'], ['Jewellery', 'jewellery', 'jewellery'], ['Balloons', 'balloons', 'balloons'], ['Personalised', 'personalised', 'personalised'],
  ['Best Sellers', 'best-sellers', 'best-seller'], ['New Arrivals', 'new-arrivals', 'new'], ['Same Day Delivery', 'same-day-delivery', 'same-day'],
  ['Flowers & Chocolates', 'flowers-and-chocolates', 'flowers-chocolates'], ['Gifts for Her', 'gifts-for-her', 'for-her'], ['Gifts for Him', 'gifts-for-him', 'for-him'],
  ['Kids Cakes', 'kids-cakes', 'kids'], ['Add-ons', 'add-ons', 'add-ons']
];
const crow = (a) => a.map(esc).join(',');
writeFileSync(join(here, 'collections.csv'), [crow(['Title', 'Handle', 'Type', 'Condition (Product tag is equal to)']), ...COLS.map(([t, h, tag]) => crow([t, h, 'Automated', tag]))].join('\n') + '\n');
console.log(`collections.csv written: ${COLS.length} collections`);
