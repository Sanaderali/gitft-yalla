'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { selectionToAttributes, validateSelection, type Selection } from '@/lib/delivery'
import { cartCreate, cartLinesAdd, cartLinesRemove, cartLinesUpdate, cartNoteUpdate, getCart, isDemo } from '@/lib/shopify'
import type { Cart } from '@/lib/types'

type Result = { error?: string }
const COOKIE = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 10 }
const DEMO_MSG = 'Demo mode: add your Shopify Storefront token to enable the cart.'

async function persist(cart: Cart) {
  const jar = await cookies()
  jar.set('cartId', cart.id, COOKIE)
  jar.set('cartQty', String(cart.totalQuantity), COOKIE)
}

export async function addToCartAction(input: { variantId: string; quantity: number; giftMessage: string; addonVariantIds: string[]; selection: Selection }): Promise<Result> {
  if (isDemo) return { error: DEMO_MSG }
  // Re-check the delivery window on the server. The browser can never be trusted.
  const problem = validateSelection(input.selection)
  if (problem) return { error: problem }

  const delivery = selectionToAttributes(input.selection)
  const msg = input.giftMessage.trim().slice(0, 200)
  const lines = [
    { merchandiseId: input.variantId, quantity: Math.min(Math.max(1, Math.floor(input.quantity) || 1), 50), attributes: [...delivery, ...(msg ? [{ key: 'Gift message', value: msg }] : [])] },
    ...input.addonVariantIds.slice(0, 10).map((id) => ({ merchandiseId: id, quantity: 1, attributes: delivery }))
  ]
  const jar = await cookies()
  const existing = jar.get('cartId')?.value
  let cart = existing ? await cartLinesAdd(existing, lines) : null
  if (!cart) cart = await cartCreate(lines)
  if (!cart) return { error: 'Could not add to cart. Please try again.' }
  await persist(cart)
  redirect('/cart')
}

async function withCart(fn: (id: string) => Promise<Cart | null>): Promise<Result> {
  if (isDemo) return { error: DEMO_MSG }
  const id = (await cookies()).get('cartId')?.value
  if (!id) return { error: 'Your cart is empty.' }
  const cart = await fn(id)
  if (!cart) return { error: 'Something went wrong. Please refresh and try again.' }
  await persist(cart)
  return {}
}

export async function setQuantityAction(lineId: string, quantity: number) {
  return withCart((id) => (quantity <= 0 ? cartLinesRemove(id, [lineId]) : cartLinesUpdate(id, [{ id: lineId, quantity: Math.min(Math.floor(quantity), 50) }])))
}
export async function removeLineAction(lineId: string) {
  return withCart((id) => cartLinesRemove(id, [lineId]))
}
export async function setNoteAction(note: string) {
  return withCart((id) => cartNoteUpdate(id, note.slice(0, 500)))
}
export async function changeDeliveryAction(lineId: string, selection: Selection): Promise<Result> {
  const problem = validateSelection(selection)
  if (problem) return { error: problem }
  return withCart(async (id) => {
    const cart = await getCart(id)
    const line = cart?.lines.find((l) => l.id === lineId)
    if (!line) return null
    const keep = line.attributes.filter((a) => !['City', 'Delivery date', 'Delivery slot', '_Date', '_Slot'].includes(a.key))
    return cartLinesUpdate(id, [{ id: lineId, attributes: [...selectionToAttributes(selection), ...keep] }])
  })
}
