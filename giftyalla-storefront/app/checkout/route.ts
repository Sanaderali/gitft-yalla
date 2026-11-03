import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { attributesToSelection, validateSelection } from '@/lib/delivery'
import { getCart } from '@/lib/shopify'

// The Checkout button points here. We re-validate every delivery window on the server,
// then hand the customer to Shopify's hosted checkout (fast, secure, COD/Stripe ready).
export async function GET() {
  const id = (await cookies()).get('cartId')?.value
  const cart = id ? await getCart(id) : null
  if (!cart || cart.lines.length === 0) redirect('/cart')
  const closed = cart.lines.some((l) => {
    const sel = attributesToSelection(l.attributes)
    return sel.date && validateSelection(sel) !== ''
  })
  if (closed) redirect('/cart?expired=1')
  redirect(cart.checkoutUrl)
}
