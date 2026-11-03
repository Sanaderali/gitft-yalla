export type Money = { amount: string; currencyCode: string }
export type Img = { url: string; altText: string | null; width: number; height: number }
export type Variant = {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  compareAtPrice: Money | null
  selectedOptions: { name: string; value: string }[]
  image?: Img | null
}
export type Product = {
  id: string
  handle: string
  title: string
  descriptionHtml?: string
  tags: string[]
  availableForSale: boolean
  featuredImage: Img | null
  images?: Img[]
  options?: { name: string; values: string[] }[]
  variants?: Variant[]
  priceRange: { min: Money; max: Money }
  compareAt: Money | null
  variantsCount: number
}
export type CollectionSummary = { handle: string; title: string; image: Img | null }
export type CartLine = {
  id: string
  quantity: number
  attributes: { key: string; value: string }[]
  total: Money
  variantId: string
  variantTitle: string
  productHandle: string
  productTitle: string
  productTags: string[]
  image: Img | null
}
export type Cart = { id: string; checkoutUrl: string; note: string; totalQuantity: number; subtotal: Money; lines: CartLine[] }
