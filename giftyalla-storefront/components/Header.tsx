import { cookies } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'
import { NAV } from '@/lib/config'

// The cart count lives in a cookie, so the header never waits on a Shopify request.
async function CartCount() {
  const qty = Number((await cookies()).get('cartQty')?.value ?? 0)
  return qty > 0 ? <span className="badge">{qty}</span> : null
}

const CartIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
)

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`logo${light ? ' logo--light' : ''}`} href="/" aria-label="Gift Yalla home"><span>Gift</span><b>Yalla!</b></Link>
  )
}

export function Header() {
  return (
    <header className="header">
      <div className="announce"><div className="container">⚡ Same-day gifting in your city. Order before the window closes!</div></div>
      <div className="container header__row">
        {/* CSS-only mobile menu: no JavaScript shipped for navigation */}
        <details className="mnav">
          <summary className="icon-btn" aria-label="Menu">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </summary>
          <nav className="mnav__panel" aria-label="Mobile">
            {NAV.map((n) =>
              n.children ? (
                <details key={n.title}>
                  <summary>{n.title}</summary>
                  {n.children.map((c) => <Link key={c.href} href={c.href}>{c.title}</Link>)}
                </details>
              ) : (
                <Link key={n.href} href={n.href}>{n.title}</Link>
              )
            )}
          </nav>
        </details>
        <Logo />
        <form className="header__search" action="/search" role="search">
          <input type="search" name="q" placeholder="Search flowers, cakes, gifts…" aria-label="Search" />
          <button type="submit" className="icon-btn" aria-label="Search">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </form>
        <div className="header__tools">
          <Link className="icon-btn" href="/cart" aria-label="Cart">
            <CartIcon />
            <Suspense fallback={null}><CartCount /></Suspense>
          </Link>
        </div>
      </div>
      <nav className="nav" aria-label="Main">
        <ul className="container nav__list">
          {NAV.map((n) => (
            <li key={n.title} className={`nav__item${n.children ? ' has-mega' : ''}`}>
              <Link className="nav__link" href={n.href}>{n.title}{n.children ? ' ▾' : ''}</Link>
              {n.children && (
                <div className="mega">
                  <div className="container mega__grid">
                    <div className="mega__col">
                      {n.children.map((c) => <Link key={c.href} href={c.href}>{c.title}</Link>)}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
