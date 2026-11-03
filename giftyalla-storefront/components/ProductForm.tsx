'use client'
import { useMemo, useState, useTransition } from 'react'
import { addToCartAction } from '@/app/actions/cart'
import { money } from '@/lib/money'
import { validateSelection, type Selection } from '@/lib/delivery'
import type { Product } from '@/lib/types'
import { DeliveryPicker } from './DeliveryPicker'

export function ProductForm({ product, addons, demo }: { product: Product; addons: { variantId: string; title: string; price: import('@/lib/types').Money }[]; demo: boolean }) {
  const variants = product.variants ?? []
  const options = product.options ?? []
  const initial = variants.find((v) => v.availableForSale) ?? variants[0]
  const [chosen, setChosen] = useState<Record<string, string>>(Object.fromEntries((initial?.selectedOptions ?? []).map((o) => [o.name, o.value])))
  const [sel, setSel] = useState<Partial<Selection>>({})
  const [qty, setQty] = useState(1)
  const [gift, setGift] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const variant = useMemo(() => variants.find((v) => v.selectedOptions.every((o) => chosen[o.name] === o.value)) ?? initial, [variants, chosen, initial])
  const sale = variant?.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const problem = validateSelection(sel)
    if (problem) { setError(problem); return }
    start(async () => {
      const r = await addToCartAction({ variantId: variant!.id, quantity: qty, giftMessage: gift, addonVariantIds: picked, selection: sel as Selection })
      if (r?.error) setError(r.error)
    })
  }

  return (
    <>
      <div className="pdp__price">
        <span className="price__now">{money(variant.price)}</span>
        {sale && <s className="price__was">{money(variant.compareAtPrice!)}</s>}
      </div>

      <form className="pdp__form" onSubmit={submit} noValidate>
        {options.map((o) => (
          <fieldset className="opt" key={o.name}>
            <legend>{o.name}</legend>
            <div className="chips">
              {o.values.map((val) => (
                <label className="chip-radio" key={val}>
                  <input type="radio" name={o.name} checked={chosen[o.name] === val} onChange={() => setChosen({ ...chosen, [o.name]: val })} />
                  <span>{val}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <DeliveryPicker value={sel} onChange={setSel} error={error && /city|day|window|time/i.test(error) ? error : ''} />

        <label className="field">
          <span className="field__label">Gift message</span>
          <textarea rows={3} maxLength={200} value={gift} onChange={(e) => setGift(e.target.value)} placeholder="Write a sweet note for the card (optional)" />
        </label>

        {addons.length > 0 && (
          <fieldset className="addons">
            <legend>🎀 Make it extra special</legend>
            <p className="muted">Add a little something. It&apos;s delivered together.</p>
            <div className="addons__list">
              {addons.map((a) => (
                <label className="addon" key={a.variantId}>
                  <input type="checkbox" checked={picked.includes(a.variantId)} onChange={(e) => setPicked(e.target.checked ? [...picked, a.variantId] : picked.filter((x) => x !== a.variantId))} />
                  <span className="addon__txt">{a.title}<b>{money(a.price)}</b></span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="pdp__buy">
          <div className="qty">
            <button type="button" aria-label="Decrease" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} aria-label="Quantity" />
            <button type="button" aria-label="Increase" onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending || !variant?.availableForSale}>
            {!variant?.availableForSale ? 'Sold out' : pending ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
        {demo && <p className="muted">Demo mode: add your Shopify token to enable the cart.</p>}
        {error && !/city|day|window|time/i.test(error) && <p className="form-error" role="alert">{error}</p>}
      </form>
    </>
  )
}
