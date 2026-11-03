import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { Logo } from './Header'
import { SITE } from '@/lib/config'

async function Year() {
  'use cache'
  cacheLife('days')
  return <>{new Date().getFullYear()}</>
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p className="footer__tag">{SITE.tagline}</p>
        </div>
        <nav className="footer__col" aria-label="Shop">
          <h4>Shop</h4>
          <Link href="/collections/flowers">Flowers</Link>
          <Link href="/collections/cakes">Cakes</Link>
          <Link href="/collections/gift-sets">Gift sets</Link>
          <Link href="/collections/same-day-delivery">Same-day delivery</Link>
        </nav>
        <div className="footer__col">
          <h4>Contact</h4>
          <span>support@giftyalla.com</span>
          <span>{SITE.whatsapp}</span>
          <span>Riyadh, Saudi Arabia</span>
        </div>
      </div>
      <div className="footer__bar">
        <div className="container footer__bar-row">
          <small>© <Year /> {SITE.name}. All rights reserved.</small>
          <ul className="pay"><li className="pay__cod">COD</li><li className="pay__cod">VISA</li><li className="pay__cod">MADA</li></ul>
        </div>
      </div>
    </footer>
  )
}
