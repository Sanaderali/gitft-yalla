import { cacheLife, cacheTag } from 'next/cache'
import { mockByCollection, mockCollections, mockCollectionTitles, mockProducts } from './mock'
import type { Cart, CartLine, CollectionSummary, Img, Money, Product, Variant } from './types'

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-07'
/** True until SHOPIFY_STOREFRONT_TOKEN is set: the site shows demo gifts and the cart is disabled. */
export const isDemo = !DOMAIN || !TOKEN

async function sf<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN! },
    body: JSON.stringify({ query, variables })
  })
  if (!res.ok) throw new Error(`Shopify ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data as T
}

/* ---------- fragments ---------- */
const IMG = 'url altText width height'
const MONEY = 'amount currencyCode'
const CARD = `fragment Card on Product { id handle title tags availableForSale featuredImage { ${IMG} }
  priceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
  compareAtPriceRange { minVariantPrice { ${MONEY} } } variantsCount { count } }`
const FULL = `fragment Full on Product { ...Card descriptionHtml
  images(first: 10) { nodes { ${IMG} } } options { name values }
  variants(first: 100) { nodes { id title availableForSale price { ${MONEY} } compareAtPrice { ${MONEY} }
    selectedOptions { name value } image { ${IMG} } } } }`

/* eslint-disable @typescript-eslint/no-explicit-any */
const toCard = (p: any): Product => ({
  id: p.id, handle: p.handle, title: p.title, tags: p.tags, availableForSale: p.availableForSale,
  featuredImage: p.featuredImage,
  priceRange: { min: p.priceRange.minVariantPrice, max: p.priceRange.maxVariantPrice },
  compareAt: Number(p.compareAtPriceRange?.minVariantPrice?.amount) > Number(p.priceRange.minVariantPrice.amount) ? p.compareAtPriceRange.minVariantPrice : null,
  variantsCount: p.variantsCount?.count ?? 1
})
const toFull = (p: any): Product => ({
  ...toCard(p), descriptionHtml: p.descriptionHtml, images: p.images.nodes, options: p.options.filter((o: any) => o.name !== 'Title'),
  variants: p.variants.nodes as Variant[]
})

/* ---------- cached catalogue reads (served from the static shell / cache) ---------- */
export async function getCollections(): Promise<CollectionSummary[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('collections')
  if (isDemo) return mockCollections
  const d = await sf<any>(`{ collections(first: 60) { nodes { handle title image { ${IMG} } products(first: 1) { nodes { featuredImage { ${IMG} } } } } } }`)
  return d.collections.nodes.map((c: any) => ({ handle: c.handle, title: c.title, image: c.image ?? c.products.nodes[0]?.featuredImage ?? null }))
}

export type Sort = 'featured' | 'best' | 'newest' | 'price-asc' | 'price-desc'
const SORTS: Record<Sort, { key: string; reverse: boolean }> = {
  featured: { key: 'COLLECTION_DEFAULT', reverse: false }, best: { key: 'BEST_SELLING', reverse: false },
  newest: { key: 'CREATED', reverse: true }, 'price-asc': { key: 'PRICE', reverse: false }, 'price-desc': { key: 'PRICE', reverse: true }
}

export async function getCollection(handle: string, sort: Sort = 'featured', first = 48): Promise<{ title: string; description: string; products: Product[] } | null> {
  'use cache'
  cacheLife('hours')
  cacheTag('collections', `collection:${handle}`, 'products')
  if (isDemo) {
    const title = mockCollectionTitles[handle]
    if (!title) return null
    const list = [...mockByCollection(handle)]
    const price = (p: Product) => Number(p.priceRange.min.amount)
    if (sort === 'price-asc') list.sort((a, b) => price(a) - price(b))
    if (sort === 'price-desc') list.sort((a, b) => price(b) - price(a))
    if (sort === 'best') list.sort((a, b) => Number(b.tags.includes('best-seller')) - Number(a.tags.includes('best-seller')))
    if (sort === 'newest') list.reverse()
    return { title, description: '', products: list.slice(0, first) }
  }
  const s = SORTS[sort]
  const d = await sf<any>(`${CARD} query($handle: String!, $first: Int!, $key: ProductCollectionSortKeys, $rev: Boolean) {
    collection(handle: $handle) { title description products(first: $first, sortKey: $key, reverse: $rev) { nodes { ...Card } } } }`,
    { handle, first, key: s.key, rev: s.reverse })
  const c = d.collection
  return c ? { title: c.title, description: c.description, products: c.products.nodes.map(toCard) } : null
}

export async function getProduct(handle: string): Promise<Product | null> {
  'use cache'
  cacheLife('hours')
  cacheTag('products', `product:${handle}`)
  if (isDemo) return mockProducts.find((p) => p.handle === handle) ?? null
  const d = await sf<any>(`${CARD} ${FULL} query($handle: String!) { product(handle: $handle) { ...Full } }`, { handle })
  return d.product ? toFull(d.product) : null
}

export async function getProductHandles(): Promise<string[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  if (isDemo) return mockProducts.map((p) => p.handle)
  const d = await sf<any>(`{ products(first: 100, sortKey: BEST_SELLING) { nodes { handle } } }`)
  return d.products.nodes.map((p: any) => p.handle)
}

export async function searchProducts(q: string): Promise<Product[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const term = q.trim().toLowerCase()
  if (!term) return []
  if (isDemo) return mockProducts.filter((p) => p.title.toLowerCase().includes(term) || p.tags.some((t) => t.includes(term))).slice(0, 24)
  const d = await sf<any>(`${CARD} query($q: String!) { products(first: 24, query: $q) { nodes { ...Card } } }`, { q: term })
  return d.products.nodes.map(toCard)
}

/* ---------- cart (never cached: per-visitor) ---------- */
const CART = `fragment CartF on Cart { id checkoutUrl note totalQuantity cost { subtotalAmount { ${MONEY} } }
  lines(first: 100) { nodes { id quantity attributes { key value } cost { totalAmount { ${MONEY} } }
    merchandise { ... on ProductVariant { id title image { ${IMG} } product { handle title tags featuredImage { ${IMG} } } } } } } }`
const toCart = (c: any): Cart => ({
  id: c.id, checkoutUrl: c.checkoutUrl, note: c.note ?? '', totalQuantity: c.totalQuantity, subtotal: c.cost.subtotalAmount as Money,
  lines: c.lines.nodes.map((l: any): CartLine => ({
    id: l.id, quantity: l.quantity, attributes: l.attributes, total: l.cost.totalAmount, variantId: l.merchandise.id, variantTitle: l.merchandise.title,
    productHandle: l.merchandise.product.handle, productTitle: l.merchandise.product.title, productTags: l.merchandise.product.tags,
    image: (l.merchandise.image ?? l.merchandise.product.featuredImage) as Img | null
  }))
})
const unwrap = (r: any): Cart | null => (r?.cart && !r.userErrors?.length ? toCart(r.cart) : null)
type LineInput = { merchandiseId: string; quantity: number; attributes?: { key: string; value: string }[] }

export async function getCart(id: string): Promise<Cart | null> {
  const d = await sf<any>(`${CART} query($id: ID!) { cart(id: $id) { ...CartF } }`, { id })
  return d.cart ? toCart(d.cart) : null
}
export async function cartCreate(lines: LineInput[]) {
  const d = await sf<any>(`${CART} mutation($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ...CartF } userErrors { message } } }`, { lines })
  return unwrap(d.cartCreate)
}
export async function cartLinesAdd(cartId: string, lines: LineInput[]) {
  const d = await sf<any>(`${CART} mutation($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartF } userErrors { message } } }`, { cartId, lines })
  return unwrap(d.cartLinesAdd)
}
export async function cartLinesUpdate(cartId: string, lines: { id: string; quantity?: number; attributes?: { key: string; value: string }[] }[]) {
  const d = await sf<any>(`${CART} mutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartF } userErrors { message } } }`, { cartId, lines })
  return unwrap(d.cartLinesUpdate)
}
export async function cartLinesRemove(cartId: string, lineIds: string[]) {
  const d = await sf<any>(`${CART} mutation($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartF } userErrors { message } } }`, { cartId, lineIds })
  return unwrap(d.cartLinesRemove)
}
export async function cartNoteUpdate(cartId: string, note: string) {
  const d = await sf<any>(`${CART} mutation($cartId: ID!, $note: String!) { cartNoteUpdate(cartId: $cartId, note: $note) { cart { ...CartF } userErrors { message } } }`, { cartId, note })
  return unwrap(d.cartNoteUpdate)
}
