import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { searchProducts } from '@/lib/shopify'

export const metadata: Metadata = { title: 'Search', robots: { index: false } }

async function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const items = await searchProducts(q)
  return (
    <>
      {q && <p className="muted">{items.length ? `Results for “${q}”` : 'Nothing found. Try another word.'}</p>}
      <ul className="grid">{items.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}</ul>
    </>
  )
}

export default function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  return (
    <section className="section">
      <div className="container">
        <header className="pagehead"><h1>Search</h1></header>
        <Suspense fallback={<div className="skeleton skeleton--hero" />}><Results {...props} /></Suspense>
      </div>
    </section>
  )
}
