'use client'
import { useState } from 'react'

/** Panels are rendered on the server and passed in, so only this tiny switcher ships JS. */
export function Tabs({ tabs }: { tabs: { label: string; panel: React.ReactNode }[] }) {
  const [i, setI] = useState(0)
  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map((t, n) => (
          <button key={t.label} type="button" role="tab" aria-selected={n === i} className={`tabs__btn${n === i ? ' is-active' : ''}`} onClick={() => setI(n)}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t, n) => (
        <div key={t.label} role="tabpanel" hidden={n !== i}>{t.panel}</div>
      ))}
    </>
  )
}
