// Pure delivery-slot logic: used in the browser (picker) AND on the server (validation).
import { DELIVERY } from './config'

export type Slot = { start: string; end: string }
const HOUR = 36e5
const DAY = 864e5

export const slotId = (s: Slot) => `${s.start}-${s.end}`
export const slotById = (id: string) => DELIVERY.slots.find((s) => slotId(s) === id)

/** Midnight (UTC-encoded) of "today" in the store's time zone. */
export function todayStore(now = Date.now()) {
  const t = new Date(now + DELIVERY.tzOffsetHours * HOUR)
  return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())
}

/** Real instant a slot starts, for a 'YYYY-MM-DD' store-local date. */
export function slotStart(iso: string, s: Slot) {
  const [y, m, d] = iso.split('-').map(Number)
  const [h, mi] = s.start.split(':').map(Number)
  return Date.UTC(y, m - 1, d, h, mi) - DELIVERY.tzOffsetHours * HOUR
}

/** A slot stays bookable until `cutoffHours` before it starts. */
export const slotOpen = (iso: string, s: Slot, now = Date.now()) => slotStart(iso, s) - now >= DELIVERY.cutoffHours * HOUR

export type DateOption = { iso: string; ts: number; index: number; open: boolean }
export function listDates(now = Date.now()): DateOption[] {
  const base = todayStore(now)
  const out: DateOption[] = []
  for (let i = 0; i < DELIVERY.daysAhead; i++) {
    const ts = base + i * DAY
    const iso = new Date(ts).toISOString().slice(0, 10)
    if (DELIVERY.blackoutDates.includes(iso)) continue
    out.push({ iso, ts, index: i, open: DELIVERY.slots.some((s) => slotOpen(iso, s, now)) })
  }
  return out
}

export function fmtTime(hhmm: string, locale = 'en') {
  const [h, m] = hhmm.split(':').map(Number)
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: m ? '2-digit' : undefined, timeZone: 'UTC' }).format(new Date(Date.UTC(2000, 0, 1, h, m)))
}
export const slotLabel = (s: Slot, locale = 'en') => `${fmtTime(s.start, locale)} – ${fmtTime(s.end, locale)}`
export const fmtDate = (ts: number, o: Intl.DateTimeFormatOptions, locale = 'en') => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...o }).format(new Date(ts))

export type Selection = { city: string; date: string; slot: string }

/** Returns an error message, or '' when valid. Never trust the browser: call this on the server too. */
export function validateSelection(sel: Partial<Selection>, now = Date.now()): string {
  if (!sel.city || !DELIVERY.cities.includes(sel.city)) return 'Please choose a delivery city.'
  if (!sel.date || !/^\d{4}-\d{2}-\d{2}$/.test(sel.date)) return 'Please choose a delivery day.'
  if (!listDates(now).some((d) => d.iso === sel.date)) return 'That delivery day is not available.'
  const s = sel.slot ? slotById(sel.slot) : undefined
  if (!s) return 'Please choose a time window.'
  if (!slotOpen(sel.date, s, now)) return 'This time window has just closed. Please choose another.'
  return ''
}

/** Cart-line attributes (= Shopify line item properties). Keys starting with "_" stay hidden at checkout. */
export function selectionToAttributes(sel: Selection) {
  const s = slotById(sel.slot)!
  const d = new Date(sel.date + 'T00:00:00Z').getTime()
  return [
    { key: 'City', value: sel.city },
    { key: 'Delivery date', value: fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'Delivery slot', value: slotLabel(s) },
    { key: '_Date', value: sel.date },
    { key: '_Slot', value: slotId(s) }
  ]
}
export function attributesToSelection(attrs: { key: string; value: string }[]): Partial<Selection> {
  const get = (k: string) => attrs.find((a) => a.key === k)?.value
  return { city: get('City'), date: get('_Date'), slot: get('_Slot') }
}
