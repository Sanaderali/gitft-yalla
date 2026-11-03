import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SortableGrid } from '@/components/SortableGrid'
import { getCollection, getCollections } from '@/lib/shopify'

type Props = { params: Promise<{ handle: string }> }

export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ handle: c.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const col = await getCollection(handle)
  return col ? { title: col.title, description: col.description || `Shop ${col.title} gifts with same-day delivery.` } : {}
}

// `params` is read at the top level: every listed handle is prerendered with its full content in the HTML.
// (A handle added in Shopify after the build is rendered on first visit, then cached.)
export default async function CollectionPage({ params }: Props) {
  const { handle } = await params
  const col = await getCollection(handle)
  if (!col) notFound()
  return (
    <section className="section">
      <div className="container">
        <header className="pagehead">
          <h1>{col.title}</h1>
          {col.description && <p className="muted">{col.description}</p>}
          <p className="muted">{col.products.length} gifts</p>
        </header>
        <SortableGrid products={col.products} />
      </div>
    </section>
  )
}
