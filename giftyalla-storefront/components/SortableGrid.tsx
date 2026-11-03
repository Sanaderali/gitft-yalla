'use client'
import { useMemo, useState } from 'react'
import type { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

const SORTS = [['featured', 'Featured'], ['best', 'Best selling'], ['newest', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']] as const
type Key = (typeof SORTS)[number][0]

/** The page is prerendered once in its default order; sorting happens instantly in the browser (no extra server trip). */
export function SortableGrid({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<Key>('featured')
  const list = useMemo(() => {
    const l = [...products]
    const price = (p: Product) => Number(p.priceRange.min.amount)
    if (sort === 'price-asc') l.sort((a, b) => price(a) - price(b))
    if (sort === 'price-desc') l.sort((a, b) => price(b) - price(a))
    if (sort === 'best') l.sort((a, b) => Number(b.tags.includes('best-seller')) - Number(a.tags.includes('best-seller')))
    if (sort === 'newest') l.reverse()
    return l
  }, [products, sort])
  return (
    <>
      <div className="toolbar" role="group" aria-label="Sort">
        <div className="chips chips--scroll">
          {SORTS.map(([k, label]) => (
            <button key={k} type="button" className={`chipbtn${k === sort ? ' is-selected' : ''}`} onClick={() => setSort(k)}>{label}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? <p className="empty">No gifts here yet.</p> : (
        <ul className="grid">
          {list.map((p, i) => <li key={p.id}><ProductCard product={p} priority={i < 4} /></li>)}
        </ul>
      )}
    </>
  )
}
