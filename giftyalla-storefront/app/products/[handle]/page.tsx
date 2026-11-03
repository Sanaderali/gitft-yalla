import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { ProductForm } from '@/components/ProductForm'
import { Tile } from '@/components/Tile'
import { getCollection, getProduct, getProductHandles, isDemo } from '@/lib/shopify'

type Props = { params: Promise<{ handle: string }> }

export async function generateStaticParams() {
  return (await getProductHandles()).map((handle) => ({ handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const p = await getProduct(handle)
  if (!p) return {}
  const desc = (p.descriptionHtml ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
  return { title: p.title, description: desc, openGraph: p.featuredImage ? { images: [p.featuredImage.url] } : undefined }
}

async function Details({ params }: Props) {
  const { handle } = await params
  const [product, addonCol] = await Promise.all([getProduct(handle), getCollection('add-ons')])
  if (!product) notFound()
  // Add-ons need their variant ids, so read the full (cached) products.
  const full = await Promise.all((addonCol?.products ?? []).slice(0, 6).map((a) => getProduct(a.handle)))
  const addonList = full.filter((a) => a && a.availableForSale && a.id !== product.id).map((a) => ({ variantId: a!.variants![0].id, title: a!.title, price: a!.priceRange.min }))
  const images = product.images ?? []
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.title, image: images.map((i) => i.url),
    offers: { '@type': 'Offer', priceCurrency: product.priceRange.min.currencyCode, price: product.priceRange.min.amount, availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }
  }
  const related = (await getCollection(product.tags.find((t) => ['flowers', 'cakes', 'chocolates', 'gift-sets', 'perfumes', 'jewellery', 'balloons', 'personalised'].includes(t)) ?? 'best-sellers'))?.products.filter((p) => p.id !== product.id).slice(0, 4) ?? []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/collections">Gifts</Link></nav>
      <div className="pdp__grid">
        <div className="gallery">
          <div className="gallery__track">
            {images.length === 0 ? <div className="gallery__item"><Tile tags={product.tags} title={product.title} /></div> :
              images.map((img, i) => (
                <div className="gallery__item" key={img.url} id={`m-${i}`}>
                  <Image src={img.url} alt={img.altText || product.title} width={img.width} height={img.height} sizes="(min-width: 990px) 50vw, 100vw" priority={i === 0} />
                </div>
              ))}
          </div>
          {images.length > 1 && (
            <div className="gallery__thumbs">
              {images.map((img, i) => <a key={img.url} href={`#m-${i}`} aria-label={`Image ${i + 1}`}><Image src={img.url} alt="" width={64} height={76} /></a>)}
            </div>
          )}
        </div>
        <div className="pdp__info">
          <div className="pdp__badges">
            {product.tags.includes('morning') && <span className="chip chip--morning">☀ Morning</span>}
            {product.tags.includes('same-day') && <span className="chip chip--same">⚡ Same day</span>}
            {product.tags.includes('best-seller') && <span className="chip chip--best">★ Best seller</span>}
          </div>
          <h1>{product.title}</h1>
          <ProductForm product={product} addons={addonList} demo={isDemo} />
          {product.descriptionHtml && (
            <details className="acc" open>
              <summary>Details</summary>
              <div className="rte" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </details>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <section className="section">
          <div className="section__head"><h2>You may also like</h2></div>
          <ul className="grid grid--4">{related.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}</ul>
        </section>
      )}
    </>
  )
}

export default function ProductPage(props: Props) {
  return (
    <section className="section pdp">
      <div className="container">
        <Suspense fallback={<div className="pdp__grid"><div className="skeleton skeleton--hero" /><div className="skeleton skeleton--hero" /></div>}>
          <Details {...props} />
        </Suspense>
      </div>
    </section>
  )
}
