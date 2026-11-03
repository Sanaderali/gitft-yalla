'use client'
import { useRef } from 'react'

/** Horizontal scroller with arrow buttons. Scrolling itself is native CSS; JS only powers the arrows. */
export function Rail({ children, className = 'rail__track--cards' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null)
  const go = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === 'rtl' ? -1 : 1
    el.scrollBy({ left: dir * rtl * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <div className="rail">
      <button type="button" className="rail__btn rail__btn--prev" onClick={() => go(-1)} aria-label="Previous">←</button>
      <ul className={`rail__track ${className}`} ref={ref}>{children}</ul>
      <button type="button" className="rail__btn rail__btn--next" onClick={() => go(1)} aria-label="Next">→</button>
    </div>
  )
}
