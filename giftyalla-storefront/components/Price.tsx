import { money } from '@/lib/money'
import type { Money } from '@/lib/types'

export function Price({ min, max, compareAt }: { min: Money; max?: Money; compareAt?: Money | null }) {
  const varies = max && max.amount !== min.amount
  return (
    <span className={`price${compareAt ? ' price--sale' : ''}`}>
      {varies && <span className="price__from">From</span>}
      <span className="price__now">{money(min)}</span>
      {compareAt && !varies && <s className="price__was">{money(compareAt)}</s>}
    </span>
  )
}
