import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { getCollection, getCollections, type Sort } from '@/lib/shopify'

type Props = { params: Promise<{ handle: string }>; searchParams: Promise<{ sort?: string }> }
const SORTS: [Sort, string][] = [['featured', 'Featured'], ['best', 'Best selling'], ['newest', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']]

export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ handle: c.handle }))
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { handle } = await params
  const col = await getCollection(handle)
  return col ? { title: col.title, description: col.description || `Shop ${col.title} gifts with same-day delivery.` } : {}
}

async function Results({ params, searchParams }: Props) {
  const { handle } = await params
  const { sort: s } = await searchParams
  const sort = (SORTS.find(([k]) => k === s)?.[0] ?? 'featured') as Sort
  const col = await getCollection(handle, sort)
  if (!col) notFound()
  return (
    <>
      <header className="pagehead">
        <h1>{col.title}</h1>
        {col.description && <p className="muted">{col.description}</p>}
        <p className="muted">{col.products.length} gifts</p>
      </header>
      <nav className="toolbar" aria-label="Sort">
        <div className="chips chips--scroll">
          {SORTS.map(([k, label]) => (
            <Link key={k} href={k === 'featured' ? `/collections/${handle}` : `/collections/${handle}?sort=${k}`} className={`chipbtn${k === sort ? ' is-selected' : ''}`} replace scroll={false}>{label}</Link>
          ))}
        </div>
      </nav>
      {col.products.length === 0 ? <p className="empty">No gifts here yet.</p> : (
        <ul className="grid">
          {col.products.map((p, i) => <li key={p.id}><ProductCard product={p} priority={i < 4} /></li>)}
        </ul>
      )}
    </>
  )
}

export default function CollectionPage(props: Props) {
  return (
    <section className="section">
      <div className="container">
        <Suspense fallback={<ul className="grid">{Array.from({ length: 8 }, (_, i) => <li key={i} className="skeleton skeleton--card" />)}</ul>}>
          <Results {...props} />
        </Suspense>
      </div>
    </section>
  )
}
