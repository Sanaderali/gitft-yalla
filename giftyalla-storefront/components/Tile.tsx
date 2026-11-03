const EMOJI: [string, string][] = [['flowers', '💐'], ['cakes', '🎂'], ['chocolates', '🍫'], ['perfumes', '🧴'], ['jewellery', '💍'], ['balloons', '🎈'], ['personalised', '✨'], ['add-ons', '🎀']]

/** Brand-coloured tile with an emoji, shown until a product has a real photo. */
export function Tile({ tags = [], title, emoji, tone }: { tags?: string[]; title: string; emoji?: string; tone?: number }) {
  const e = emoji ?? EMOJI.find(([t]) => tags.includes(t))?.[1] ?? '🎁'
  return (
    <div className={`tile tile--${tone ?? title.length % 4}`} role="img" aria-label={title}>
      <span className="tile__emoji">{e}</span>
    </div>
  )
}
