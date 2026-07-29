import type { Media } from '@/payload-types'
import type { CSSProperties, JSX } from 'react'

/**
 * The abstract plate that anchors an About section — the CMS photograph when one exists, and
 * the section's brand gradient under grain when one does not.
 *
 * THE FALLBACK IS THE NORMAL CASE, not an edge case. No item in any About block carries a
 * media reference (checked against the staging cluster: aboutThesis, aboutApproach and
 * aboutBeliefs are `media: none` for every item), so the blocks this replaces were rendering
 * their gradient fallback one hundred percent of the time — the "grayscale photo" the previous
 * components were written around has never once appeared on the page. Rendering the plate only
 * when media exists would therefore have left a permanent hole in the composition.
 *
 * The three gradients are carried over verbatim from the blocks they came from — azure for the
 * thesis, emerald for the approach, violet for the beliefs — so each section keeps the colour
 * identity it already had.
 *
 * Purely decorative: `aria-hidden`, and it states nothing. If a photograph is added in the CMS
 * later it takes over automatically with no code change.
 */
const TONE = {
  azure: 'radial-gradient(135% 135% at 78% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
  emerald: 'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)',
  violet: 'radial-gradient(135% 135% at 78% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
} as const

export default function AboutPlate({
  media,
  tone,
  className = '',
  parallax = 18,
}: {
  media?: Media
  tone: keyof typeof TONE
  className?: string
  /** Travel in px for the plate's drift against the scroll. */
  parallax?: number
}): JSX.Element {
  const url = media?.url ?? undefined

  return (
    <figure aria-hidden className={`am-r overflow-hidden rounded-md ${className}`}>
      <span className="am-par block h-full w-full" style={{ '--am-amt': `${parallax}px` } as CSSProperties}>
        <span className="am-zoom relative block h-full w-full">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover grayscale" />
          ) : (
            <span className="block h-full w-full" style={{ backgroundImage: TONE[tone] }} />
          )}
          {/* The signature grain, over either surface. */}
          <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
        </span>
      </span>
    </figure>
  )
}
