import type { JSX, ReactNode } from 'react'

/**
 * The brand's signature noise-gradient panel (mirrors the hero's card treatment in
 * src/components/sections/heroFeatured.tsx). A radial TONE gradient sits under the local
 * /noise.svg grain overlay and a bottom legibility scrim. Pure CSS — renders identically
 * whether or not CMS media is available, so it doubles as the graceful image-missing state.
 *
 * Content-type tones match the site convention: insight/case study = teal→emerald, the
 * design's hero/related-card gradient (radial teal #26d9bb + green #2dd280 over a dark
 * teal linear base).
 */

export type PanelTone = 'emerald' | 'crimson' | 'violet' | 'azure'

const TONE: Record<PanelTone, string> = {
  // Insight / case study — the design's signature teal→green panel.
  emerald:
    'radial-gradient(120% 120% at 22% 16%, rgba(38,217,187,0.7) 0%, rgba(45,210,128,0.5) 38%, rgba(23,69,61,0.9) 70%, #122a36 100%)',
  crimson: 'radial-gradient(135% 135% at 18% 12%, #c1285f 0%, #6d1734 42%, #1d0a14 100%)',
  violet: 'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
  azure: 'radial-gradient(135% 135% at 22% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
}

export default function GradientPanel({
  tone = 'emerald',
  className = '',
  radius = 'rounded-md',
  scrim = false,
  children,
}: {
  tone?: PanelTone
  className?: string
  /**
   * Corner radius utility for the panel. Defaults to the site card radius (rounded-md, 5px);
   * the insight hero panel passes rounded-lg (8px) to match Figma's Space/8 corner.
   */
  radius?: string
  /** Add a bottom-to-top scrim — use when light text overlays the panel. */
  scrim?: boolean
  children?: ReactNode
}): JSX.Element {
  return (
    <div className={`relative overflow-hidden ${radius} ${className}`}>
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: TONE[tone] }} />
      <span
        aria-hidden
        className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
      />
      {scrim && (
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />
      )}
      {children && <div className="relative z-10 flex h-full flex-col">{children}</div>}
    </div>
  )
}
