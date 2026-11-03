import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { Rail } from './Rail'
import { getCollection } from '@/lib/shopify'

export async function ProductRail({ heading, sub, handle, tone = 'none', limit = 10 }: { heading: string; sub?: string; handle: string; tone?: 'none' | 'mint' | 'lilac'; limit?: number }) {
  const col = await getCollection(handle)
  if (!col || col.products.length === 0) return null
  return (
    <section className={`section section--${tone}`}>
      <div className="container">
        <div className="section__head">
          <div>
            <h2>{heading}</h2>
            {sub && <p className="muted">{sub}</p>}
          </div>
          <Link className="link-arrow" href={`/collections/${handle}`}>Shop all →</Link>
        </div>
        <Rail>
          {col.products.slice(0, limit).map((p) => (
            <li key={p.id} className="pcard-wrap"><ProductCard product={p} /></li>
          ))}
        </Rail>
      </div>
    </section>
  )
}
