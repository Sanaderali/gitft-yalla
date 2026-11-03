import Image from 'next/image'
import Link from 'next/link'
import { Price } from './Price'
import { Tile } from './Tile'
import type { Product } from '@/lib/types'

/** Every card opens the product page: a delivery day + window must be chosen before adding to cart. */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const href = `/products/${product.handle}`
  return (
    <article className="pcard">
      <div className="pcard__media">
        <Link className="pcard__link" href={href} aria-label={product.title}>
          {product.featuredImage ? (
            <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} fill sizes="(min-width: 990px) 20vw, 46vw" priority={priority} />
          ) : (
            <Tile tags={product.tags} title={product.title} />
          )}
        </Link>
        {product.tags.includes('best-seller') ? <span className="ribbon">Best seller</span> : product.tags.includes('new') ? <span className="ribbon ribbon--new">New</span> : null}
        {!product.availableForSale ? (
          <span className="ribbon ribbon--out">Sold out</span>
        ) : product.variantsCount > 1 ? (
          <Link className="pcard__opt" href={href}>{product.variantsCount} options ▾</Link>
        ) : (
          <Link className="pcard__plus" href={href} aria-label="Choose delivery">+</Link>
        )}
      </div>
      <Link className="pcard__title" href={href}>{product.title}</Link>
      <div className="pcard__meta">
        <Price min={product.priceRange.min} max={product.priceRange.max} compareAt={product.compareAt} />
        {product.tags.includes('morning') ? <span className="chip chip--morning">☀ Morning</span> : product.tags.includes('same-day') ? <span className="chip chip--same">⚡ Same day</span> : null}
      </div>
    </article>
  )
}
