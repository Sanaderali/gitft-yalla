import Link from 'next/link'
import { CollectionTiles } from '@/components/CollectionTiles'
import { ProductCard } from '@/components/ProductCard'
import { ProductRail } from '@/components/ProductRail'
import { Rail } from '@/components/Rail'
import { Tabs } from '@/components/Tabs'
import { getCollection } from '@/lib/shopify'

const USP = [
  ['🚚', 'Same-day delivery', 'Pick your time window'],
  ['🎁', 'Wrapped with love', 'Free gift card message'],
  ['💵', 'Pay on delivery', 'Cash on delivery available'],
  ['⏰', 'Live till late', 'Slots until 9 PM']
]

async function BestGifts() {
  const tabs = await Promise.all(
    [['Flowers', 'flowers'], ['Cakes', 'cakes'], ['Jewellery', 'jewellery'], ['Perfumes', 'perfumes']].map(async ([label, handle]) => {
      const col = await getCollection(handle)
      return {
        label,
        panel: (
          <Rail>
            {(col?.products ?? []).slice(0, 8).map((p) => <li key={p.id} className="pcard-wrap"><ProductCard product={p} /></li>)}
          </Rail>
        )
      }
    })
  )
  return (
    <section className="section section--lilac">
      <div className="container">
        <div className="section__head section__head--center">
          <div>
            <h2>Best gifts</h2>
            <p className="muted">Celebrate life&apos;s special moments with our bestsellers</p>
          </div>
        </div>
        <Tabs tabs={tabs} />
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__main hero__main--art">
            <div className="hero__copy">
              <span className="eyebrow">Yalla, surprise someone</span>
              <h1>Surprise them. Today.</h1>
              <p>Fresh flowers, dreamy cakes and gifts they&apos;ll screenshot. Delivered same-day, wrapped with love.</p>
              <Link className="btn btn--sun" href="/collections/same-day-delivery">Shop gifts →</Link>
            </div>
            <div className="hero__deco" aria-hidden="true"><i>🎁</i><i>💐</i><i>🎂</i><i>🎈</i></div>
          </div>
          <div className="hero__side">
            <Link className="promo promo--1" href="/collections/birthday"><span className="promo__copy"><b>Make birthdays extra special</b><small>Cakes, balloons &amp; more</small><em>Send now →</em></span></Link>
            <Link className="promo promo--2" href="/collections/flowers-and-chocolates"><span className="promo__copy"><b>Flowers &amp; chocolates, perfectly paired</b><small>The classic that never fails</small><em>Gift now →</em></span></Link>
          </div>
        </div>
      </section>

      <section className="usp">
        <div className="container usp__grid">
          {USP.map(([icon, t, s]) => (
            <div className="usp__item" key={t}><span className="usp__icon">{icon}</span><div><b>{t}</b><small>{s}</small></div></div>
          ))}
        </div>
      </section>

      <CollectionTiles heading="Celebrate every moment" shape="arch" items={[
        { handle: 'birthday', emoji: '🎂' }, { handle: 'get-well-soon', emoji: '🌷' }, { handle: 'love', emoji: '❤️' }, { handle: 'graduation', emoji: '🎓' },
        { handle: 'new-born', emoji: '🍼' }, { handle: 'wedding', emoji: '💍' }, { handle: 'anniversary', emoji: '🥂' }
      ]} />
      <CollectionTiles heading="Gifts by category" shape="arch" items={[
        { handle: 'new-arrivals', emoji: '✨' }, { handle: 'gift-sets', emoji: '🎁' }, { handle: 'flowers', emoji: '💐' }, { handle: 'cakes', emoji: '🍰' },
        { handle: 'chocolates', emoji: '🍫' }, { handle: 'perfumes', emoji: '🧴' }, { handle: 'jewellery', emoji: '💎' }, { handle: 'balloons', emoji: '🎈' }
      ]} />

      <ProductRail heading="Flowers & Chocolates" sub="Sweet surprises paired with fresh blooms" handle="flowers-and-chocolates" tone="mint" />
      <BestGifts />

      <section className="section">
        <div className="container">
          <Link className="banner banner--primary" href="/collections/personalised">
            <span className="banner__copy">
              <h2>Make it personal ✨</h2>
              <p>Names, initials, messages. Gifts that say &ldquo;I thought about you&rdquo;.</p>
              <span className="btn btn--sun">Personalise now →</span>
            </span>
          </Link>
        </div>
      </section>

      <CollectionTiles heading="Perfect gift sets for every occasion" shape="card" items={[
        { handle: 'gift-sets', emoji: '🎁', title: 'All gift sets' }, { handle: 'gifts-for-her', emoji: '💝' }, { handle: 'gifts-for-him', emoji: '🎩' },
        { handle: 'flowers-and-chocolates', emoji: '💐', title: 'With chocolate' }, { handle: 'perfumes', emoji: '🧴', title: 'With perfume' }, { handle: 'jewellery', emoji: '💍', title: 'With jewellery' }
      ]} />
      <ProductRail heading="Fresh in" sub="New arrivals we're obsessed with" handle="new-arrivals" tone="lilac" />
      <CollectionTiles heading="Kids' birthday character cakes" sub="Fresh cakes delivered today" shape="round" items={[
        { handle: 'kids-cakes', emoji: '🦖', title: 'Dinosaur' }, { handle: 'kids-cakes', emoji: '🐰', title: 'Bunny' }, { handle: 'kids-cakes', emoji: '⭐', title: 'Star' },
        { handle: 'kids-cakes', emoji: '🐱', title: 'Kitty' }, { handle: 'kids-cakes', emoji: '❄️', title: 'Frozen' }, { handle: 'kids-cakes', emoji: '⛏️', title: 'Pixel' }
      ]} />
    </>
  )
}
