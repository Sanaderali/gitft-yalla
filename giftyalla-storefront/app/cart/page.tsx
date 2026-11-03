import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { CartView } from '@/components/CartView'
import { getCart, isDemo } from '@/lib/shopify'

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } }

async function CartContent() {
  const id = isDemo ? undefined : (await cookies()).get('cartId')?.value
  const cart = id ? await getCart(id) : null
  if (!cart || cart.lines.length === 0) {
    return (
      <div className="empty">
        <p>{isDemo ? 'Demo mode: connect Shopify to enable the cart.' : "Your cart is empty. Let's find a gift!"}</p>
        <Link className="btn btn--primary" href="/collections">Continue shopping</Link>
      </div>
    )
  }
  return <CartView cart={cart} />
}

export default function CartPage() {
  return (
    <section className="section">
      <div className="container">
        <header className="pagehead"><h1>Your cart</h1></header>
        <Suspense fallback={<div className="skeleton skeleton--hero" />}><CartContent /></Suspense>
      </div>
    </section>
  )
}
