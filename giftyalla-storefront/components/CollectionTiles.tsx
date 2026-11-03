import Image from 'next/image'
import Link from 'next/link'
import { Rail } from './Rail'
import { getCollections } from '@/lib/shopify'

export type TileSpec = { handle: string; emoji: string; title?: string }

export async function CollectionTiles({ heading, sub, shape, items }: { heading: string; sub?: string; shape: 'arch' | 'round' | 'card'; items: TileSpec[] }) {
  const all = await getCollections()
  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <h2>{heading}</h2>
            {sub && <p className="muted">{sub}</p>}
          </div>
        </div>
        <Rail className="rail__track--tiles">
          {items.map((it, n) => {
            const col = all.find((c) => c.handle === it.handle)
            const label = it.title ?? col?.title ?? it.handle
            return (
              <li key={`${it.handle}-${n}`} className={`ctile ctile--${shape} ctile--tone${n % 4}`}>
                <Link href={`/collections/${it.handle}`}>
                  <span className="ctile__media">
                    {col?.image ? <Image src={col.image.url} alt={label} width={300} height={340} sizes="160px" /> : <span className="ctile__emoji">{it.emoji}</span>}
                  </span>
                  <span className="ctile__label">{label}</span>
                </Link>
              </li>
            )
          })}
        </Rail>
      </div>
    </section>
  )
}
