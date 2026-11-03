'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { changeDeliveryAction, removeLineAction, setNoteAction, setQuantityAction } from '@/app/actions/cart'
import { attributesToSelection, validateSelection, type Selection } from '@/lib/delivery'
import { money } from '@/lib/money'
import type { Cart } from '@/lib/types'
import { DeliveryPicker } from './DeliveryPicker'
import { Tile } from './Tile'

export function CartView({ cart }: { cart: Cart }) {
  const [now, setNow] = useState(0)
  const [pending, start] = useTransition()
  const [editing, setEditing] = useState<string | null>(null)
  const [sel, setSel] = useState<Partial<Selection>>({})
  const [err, setErr] = useState('')
  const dlg = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const closed = (attrs: Cart['lines'][number]['attributes']) => {
    const s = attributesToSelection(attrs)
    return !!now && !!s.date && validateSelection(s, now) !== ''
  }
  const anyClosed = cart.lines.some((l) => closed(l.attributes))

  const run = (fn: () => Promise<{ error?: string }>) => start(async () => { const r = await fn(); setErr(r.error ?? '') })

  function openEdit(id: string, attrs: Cart['lines'][number]['attributes']) {
    setEditing(id); setSel(attributesToSelection(attrs)); setErr(''); dlg.current?.showModal()
  }
  function save() {
    const problem = validateSelection(sel)
    if (problem) { setErr(problem); return }
    start(async () => {
      const r = await changeDeliveryAction(editing!, sel as Selection)
      if (r.error) setErr(r.error); else { setErr(''); dlg.current?.close() }
    })
  }

  return (
    <div className="cart" aria-busy={pending}>
      <div className="cart__items">
        {cart.lines.map((l) => {
          const bad = closed(l.attributes)
          return (
            <article key={l.id} className={`citem${bad ? ' is-expired' : ''}`}>
              <Link className="citem__img" href={`/products/${l.productHandle}`}>
                {l.image ? <Image src={l.image.url} alt={l.image.altText || l.productTitle} width={160} height={200} sizes="110px" /> : <Tile tags={l.productTags} title={l.productTitle} />}
              </Link>
              <div className="citem__body">
                <Link className="citem__title" href={`/products/${l.productHandle}`}>{l.productTitle}</Link>
                {l.variantTitle !== 'Default Title' && <small className="muted">{l.variantTitle}</small>}
                <ul className="citem__props">
                  {l.attributes.filter((a) => !a.key.startsWith('_') && a.value).map((a) => <li key={a.key}><b>{a.key}:</b> {a.value}</li>)}
                </ul>
                {bad && <p className="citem__warn">This time window has just closed. Please choose another.</p>}
                {l.attributes.some((a) => a.key === '_Date') && <button type="button" className="link-btn" onClick={() => openEdit(l.id, l.attributes)}>Change delivery</button>}
              </div>
              <div className="citem__side">
                <b className="citem__price">{money(l.total)}</b>
                <label className="qty qty--sm">
                  <span className="visually-hidden">Quantity</span>
                  <input type="number" min={0} defaultValue={l.quantity} onBlur={(e) => { const q = Number(e.target.value); if (q !== l.quantity) run(() => setQuantityAction(l.id, q)) }} />
                </label>
                <button type="button" className="link-btn" onClick={() => run(() => removeLineAction(l.id))}>Remove</button>
              </div>
            </article>
          )
        })}
      </div>

      <aside className="cart__summary">
        <label className="field">
          <span className="field__label">Order note</span>
          <textarea rows={3} defaultValue={cart.note} placeholder="Anything we should know? (optional)" onBlur={(e) => { if (e.target.value !== cart.note) run(() => setNoteAction(e.target.value)) }} />
        </label>
        <div className="sumrow"><span>Subtotal</span><b>{money(cart.subtotal)}</b></div>
        <p className="muted">Delivery fee and taxes are calculated at checkout.</p>
        {anyClosed && <p className="form-error" role="alert">Some delivery windows have closed. Please update them to continue.</p>}
        {err && !editing && <p className="form-error" role="alert">{err}</p>}
        {/* A plain link on purpose: /checkout re-validates every window on the server first. */}
        <a className={`btn btn--primary btn--lg btn--block${anyClosed ? ' is-disabled' : ''}`} href="/checkout" aria-disabled={anyClosed} onClick={(e) => { if (anyClosed) e.preventDefault() }}>Checkout</a>
        <Link className="link-arrow" href="/collections">Continue shopping →</Link>
      </aside>

      <dialog className="dlg" ref={dlg} onClose={() => setEditing(null)}>
        <div className="dlg__body">
          <button type="button" className="icon-btn dlg__close" aria-label="Close" onClick={() => dlg.current?.close()}>✕</button>
          <DeliveryPicker value={sel} onChange={setSel} error={editing ? err : ''} />
          <div className="dlg__actions"><button type="button" className="btn btn--primary" disabled={pending} onClick={save}>Save</button></div>
        </div>
      </dialog>
    </div>
  )
}
