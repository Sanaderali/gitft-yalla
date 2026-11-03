import type { Metadata } from 'next'
import Link from 'next/link'
import { getCollections } from '@/lib/shopify'

export const metadata: Metadata = { title: 'All gifts' }

export default async function Collections() {
  const cols = await getCollections()
  return (
    <section className="section">
      <div className="container">
        <header className="pagehead"><h1>Shop all</h1></header>
        <ul className="grid grid--tiles">
          {cols.map((c, n) => (
            <li key={c.handle} className={`ctile ctile--card ctile--tone${n % 4}`}>
              <Link href={`/collections/${c.handle}`}><span className="ctile__media"><span className="ctile__emoji">🎁</span></span><span className="ctile__label">{c.title}</span></Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
