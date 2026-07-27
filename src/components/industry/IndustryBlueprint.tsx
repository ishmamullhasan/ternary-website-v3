import type { JSX } from 'react'

/**
 * Isometric illustration for a homepage industry card. One artwork per sector (white line-art on
 * transparent, sliced from the reference sheet into public/industries/*.png), selected by keyword on
 * the industry title so it is robust to slug/title variations. A plain <img>: the art is decorative,
 * fixed-size, and already transparent line-art — next/image's optimization adds nothing here.
 */
function fileFor(title: string): string {
  const t = title.toLowerCase()
  if (/bank|capital|financ|invest/.test(t)) return 'banking'
  if (/manufactur|industrial|energy|supply/.test(t)) return 'manufacturing'
  if (/health|care|medic|life science/.test(t)) return 'healthcare'
  if (/sport|entertain|media|leisure/.test(t)) return 'sports'
  if (/consumer|goods|retail|commerce/.test(t)) return 'consumer'
  if (/hospitalit|travel|tourism/.test(t)) return 'hospitality'
  if (/tech|platform|software|digital|saas|cloud/.test(t)) return 'technology'
  if (/public|govern|sector|civic/.test(t)) return 'public'
  return 'public'
}

export default function IndustryBlueprint({
  title,
  className,
}: {
  title?: string | null
  className?: string
}): JSX.Element {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative transparent line-art; no optimization benefit */}
      <img
        src={`/industries/${fileFor(title ?? '')}.png`}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className={`h-full w-full select-none object-contain${className ? ` ${className}` : ''}`}
      />
    </>
  )
}
