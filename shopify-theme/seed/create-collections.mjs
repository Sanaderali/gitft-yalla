// Creates the automated (tag-based) collections the theme expects and publishes them
// to the Online Store. Free, uses the Shopify Admin API with a token from your own app.
//
// Option A (Dev Dashboard app, client credentials):
//   SHOP=your-store.myshopify.com CLIENT_ID=... CLIENT_SECRET=... node seed/create-collections.mjs
// Option B (you already have an Admin API access token):
//   SHOP=your-store.myshopify.com TOKEN=shpat_... node seed/create-collections.mjs
//
// Needed app scopes: write_products, read_publications, write_publications
// Optional: API_VERSION=2025-10 (defaults to 2026-07)

const { SHOP, TOKEN, CLIENT_ID, CLIENT_SECRET } = process.env;
const VERSION = process.env.API_VERSION || '2026-07';
if (!SHOP) { console.error('Set SHOP=your-store.myshopify.com'); process.exit(1); }

async function getToken() {
  if (TOKEN) return TOKEN;
  if (!CLIENT_ID || !CLIENT_SECRET) { console.error('Set TOKEN, or CLIENT_ID + CLIENT_SECRET'); process.exit(1); }
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' })
  });
  const j = await res.json();
  if (!j.access_token) { console.error('Could not get a token:', j); process.exit(1); }
  return j.access_token;
}

// [title, handle, tag]
const COLLECTIONS = [
  ['Birthday', 'birthday', 'birthday'], ['Anniversary', 'anniversary', 'anniversary'], ['Love', 'love', 'love'],
  ['Graduation', 'graduation', 'graduation'], ['New Born', 'new-born', 'new-born'], ['Get Well Soon', 'get-well-soon', 'get-well-soon'],
  ['Wedding', 'wedding', 'wedding'],
  ['Flowers', 'flowers', 'flowers'], ['Cakes', 'cakes', 'cakes'], ['Chocolates', 'chocolates', 'chocolates'],
  ['Gift Sets', 'gift-sets', 'gift-sets'], ['Perfumes', 'perfumes', 'perfumes'], ['Jewellery', 'jewellery', 'jewellery'],
  ['Balloons', 'balloons', 'balloons'], ['Personalised', 'personalised', 'personalised'],
  ['Best Sellers', 'best-sellers', 'best-seller'], ['New Arrivals', 'new-arrivals', 'new'], ['Same Day Delivery', 'same-day-delivery', 'same-day'],
  ['Flowers & Chocolates', 'flowers-and-chocolates', 'flowers-chocolates'],
  ['Gifts for Her', 'gifts-for-her', 'for-her'], ['Gifts for Him', 'gifts-for-him', 'for-him'],
  ['Kids Cakes', 'kids-cakes', 'kids'], ['Add-ons', 'add-ons', 'add-ons']
];

const token = await getToken();
const gql = async (query, variables) => {
  const res = await fetch(`https://${SHOP}/admin/api/${VERSION}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token }, body: JSON.stringify({ query, variables })
  });
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
};

const pubs = await gql('{ publications(first: 20) { nodes { id name } } }');
const online = pubs.publications.nodes.find((p) => /online store/i.test(p.name));
if (!online) console.warn('Online Store publication not found: collections will be created but not published.');

for (const [title, handle, tag] of COLLECTIONS) {
  try {
    const d = await gql(
      `mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id handle } userErrors { field message } } }`,
      { input: { title, handle, ruleSet: { appliedDisjunctively: false, rules: [{ column: 'TAG', relation: 'EQUALS', condition: tag }] } } }
    );
    const r = d.collectionCreate;
    if (r.userErrors.length) { console.log(`- ${title}: ${r.userErrors.map((e) => e.message).join('; ')}`); continue; }
    if (online) {
      await gql(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`,
        { id: r.collection.id, input: [{ publicationId: online.id }] });
    }
    console.log(`✓ ${title} (${handle}) <- tag "${tag}"`);
  } catch (e) { console.log(`✗ ${title}: ${e.message}`); }
}
