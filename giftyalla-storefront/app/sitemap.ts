import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config'
import { getCollections, getProductHandles } from '@/lib/shopify'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cols, handles] = await Promise.all([getCollections(), getProductHandles()])
  return [
    { url: SITE.url },
    ...cols.map((c) => ({ url: `${SITE.url}/collections/${c.handle}` })),
    ...handles.map((h) => ({ url: `${SITE.url}/products/${h}` }))
  ]
}
