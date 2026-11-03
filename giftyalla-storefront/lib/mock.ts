// Demo data so the site runs (and builds) before Shopify keys are added.
import raw from '../data/mock-products.json'
import type { CollectionSummary, Product } from './types'

type Raw = { handle: string; title: string; type: string; tags: string[]; optionName: string; variants: { title: string; price: number }[] }
const cur = (n: number) => ({ amount: n.toFixed(2), currencyCode: 'SAR' })

export const mockProducts: Product[] = (raw as Raw[]).map((p) => {
  const prices = p.variants.map((v) => v.price)
  const hasOptions = p.variants.length > 1
  return {
    id: `mock-${p.handle}`,
    handle: p.handle,
    title: p.title,
    descriptionHtml: `<p>${p.title}. A beautiful demo gift. Replace this text, photos and price in Shopify.</p><ul><li>Hand-wrapped and delivered fresh</li><li>Free gift card message</li><li>Same-day delivery in selected cities</li></ul>`,
    tags: p.tags,
    availableForSale: true,
    featuredImage: null,
    images: [],
    options: hasOptions ? [{ name: p.optionName, values: p.variants.map((v) => v.title) }] : [],
    variants: p.variants.map((v, i) => ({
      id: `mock-${p.handle}-${i}`,
      title: v.title,
      availableForSale: true,
      price: cur(v.price),
      compareAtPrice: null,
      selectedOptions: hasOptions ? [{ name: p.optionName, value: v.title }] : [],
      image: null
    })),
    priceRange: { min: cur(Math.min(...prices)), max: cur(Math.max(...prices)) },
    compareAt: null,
    variantsCount: p.variants.length
  }
})

const TAG_FOR: Record<string, string> = {
  'best-sellers': 'best-seller', 'new-arrivals': 'new', 'same-day-delivery': 'same-day',
  'flowers-and-chocolates': 'flowers-chocolates', 'gifts-for-her': 'for-her', 'gifts-for-him': 'for-him', 'kids-cakes': 'kids'
}
export const mockCollectionTitles: Record<string, string> = {
  birthday: 'Birthday', anniversary: 'Anniversary', love: 'Love', graduation: 'Graduation', 'new-born': 'New Born', 'get-well-soon': 'Get Well Soon', wedding: 'Wedding',
  flowers: 'Flowers', cakes: 'Cakes', chocolates: 'Chocolates', 'gift-sets': 'Gift Sets', perfumes: 'Perfumes', jewellery: 'Jewellery', balloons: 'Balloons', personalised: 'Personalised',
  'best-sellers': 'Best Sellers', 'new-arrivals': 'New Arrivals', 'same-day-delivery': 'Same Day Delivery', 'flowers-and-chocolates': 'Flowers & Chocolates',
  'gifts-for-her': 'Gifts for Her', 'gifts-for-him': 'Gifts for Him', 'kids-cakes': 'Kids Cakes', 'add-ons': 'Add-ons'
}
export const mockCollections: CollectionSummary[] = Object.entries(mockCollectionTitles).map(([handle, title]) => ({ handle, title, image: null }))
export const mockByCollection = (handle: string) => {
  const tag = TAG_FOR[handle] ?? handle
  return mockProducts.filter((p) => p.tags.includes(tag))
}
