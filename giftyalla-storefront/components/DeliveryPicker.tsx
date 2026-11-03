'use client'
import { useEffect, useState } from 'react'
import { DELIVERY } from '@/lib/config'
import { fmtDate, listDates, slotId, slotLabel, slotOpen, type Selection } from '@/lib/delivery'

/**
 * City → day → time window. Slots close `cutoffHours` before they start (rules in lib/config.ts).
 * Time is only read after mount, so server HTML and first client render always match.
 */
export function DeliveryPicker({ value, onChange, error }: { value: Partial<Selection>; onChange: (v: Partial<Selection>) => void; error?: string }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  // Remember the customer's city.
  useEffect(() => {
    if (value.city) return
    try { const c = localStorage.getItem('gy_city'); if (c && DELIVERY.cities.includes(c)) onChange({ ...value, city: c }) } catch { /* private mode */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dates = now ? listDates(now) : []
  // Pick the first open day automatically; drop a choice that has just closed.
  useEffect(() => {
    if (!now) return
    const open = dates.filter((d) => d.open)
    if (!value.date && open[0]) onChange({ ...value, date: open[0].iso })
    else if (value.date && !open.some((d) => d.iso === value.date)) onChange({ ...value, date: open[0]?.iso ?? '', slot: '' })
    else if (value.date && value.slot) {
      const s = DELIVERY.slots.find((x) => slotId(x) === value.slot)
      if (s && !slotOpen(value.date, s, now)) onChange({ ...value, slot: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  return (
    <div className="dpick">
      <div className="dpick__head">
        <h3>🚚 When should it arrive?</h3>
        <p>Pick a city, a day and a time window.</p>
      </div>

      <label className="field">
        <span className="field__label">City</span>
        <select value={value.city ?? ''} onChange={(e) => { try { localStorage.setItem('gy_city', e.target.value) } catch { /* ignore */ } onChange({ ...value, city: e.target.value }) }}>
          <option value="">Choose your city</option>
          {DELIVERY.cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <div className="field">
        <span className="field__label">Delivery day</span>
        <div className="chips chips--scroll">
          {now === null
            ? Array.from({ length: 5 }, (_, i) => <span key={i} className="chipbtn skeleton" aria-hidden="true">&nbsp;</span>)
            : dates.map((d) => (
                <button key={d.iso} type="button" disabled={!d.open} className={`chipbtn${value.date === d.iso ? ' is-selected' : ''}`} onClick={() => onChange({ ...value, date: d.iso, slot: '' })}>
                  <span>{d.index === 0 ? 'Today' : d.index === 1 ? 'Tomorrow' : fmtDate(d.ts, { weekday: 'short' })}</span>
                  <small>{fmtDate(d.ts, { day: 'numeric', month: 'short' })}</small>
                </button>
              ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Time window</span>
        <div className="chips">
          {DELIVERY.slots.map((s) => {
            const open = !!now && !!value.date && slotOpen(value.date, s, now)
            const id = slotId(s)
            return (
              <button key={id} type="button" disabled={!open} className={`chipbtn${value.slot === id && open ? ' is-selected' : ''}`} onClick={() => onChange({ ...value, slot: id })}>
                <span>{slotLabel(s)}</span>
                {now && value.date && !open && <small>Closed</small>}
              </button>
            )
          })}
        </div>
        <p className="dpick__note">Windows close {DELIVERY.cutoffHours}h before they start.</p>
      </div>
      {error && <p className="dpick__error" role="alert">{error}</p>}
    </div>
  )
}
