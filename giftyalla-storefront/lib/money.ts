import type { Money } from './types'
export function money(m: Money, locale = 'en') {
  const n = Number(m.amount)
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: m.currencyCode, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n)
  } catch {
    return `${m.currencyCode} ${n}`
  }
}
