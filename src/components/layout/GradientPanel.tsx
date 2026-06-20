import { cn } from '@/lib/utils'
import type { JSX, ReactNode } from 'react'

/**
 * Signature noise-gradient device for the Stories surfaces.
 *
 * The brand's one bold visual moment: a content-type-keyed radial/linear gradient
 * field with a local grain overlay (no external image dependency) and a legibility
 * scrim so eggshell text holds on the brightest gradients. Reused by the archive
 * grid tiles, the featured case-study panel, related-story media and the detail-page
 * hero/cluster — keeping the page cohesive even when CMS media is missing.
 *
 * Tones map to the content taxonomy: case study = crimson, insight/thought piece =
 * violet, press = emerald, research/data = azure (plus magenta/indigo accents).
 */

export type Tone = 'crimson' | 'violet' | 'emerald' | 'azure' | 'magenta' | 'indigo'

// Rich, multi-stop radial gradients with a warm/cool spread across content types.
// Origin sits top-left so the brightest point reads as a light source the grain sits over.
export const TONE: Record<Tone, string> = {
  crimson: 'radial-gradient(135% 135% at 18% 12%, #c1285f 0%, #6d1734 42%, #1d0a14 100%)',
  violet: 'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
  emerald: 'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)',
  azure: 'radial-gradient(135% 135% at 22% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
  magenta: 'radial-gradient(135% 135% at 20% 12%, #b6249a 0%, #5e1457 44%, #190a1c 100%)',
  indigo: 'radial-gradient(135% 135% at 22% 14%, #4f6bed 0%, #25307e 44%, #0c1030 100%)',
}

// The featured-card / detail-hero panel from the design: a 143deg green base with two
// green radial glows. The gradient IS the artwork — never a photo.
export const FEATURED_PANEL =
  'radial-gradient(120% 120% at 78% 18%, rgba(45,210,128,0.85) 0%, rgba(45,210,128,0) 55%), ' +
  'radial-gradient(120% 120% at 22% 92%, rgba(38,217,187,0.7) 0%, rgba(38,217,187,0) 50%), ' +
  'linear-gradient(143deg, #174536 0%, #14363d 100%)'

const CONTENT_TYPE_TONE: Record<string, Tone> = {
  story: 'crimson',
  insight: 'violet',
  pressRelease: 'emerald',
  research: 'azure',
}

/** Deterministically pick a tone from a content type, falling back across the palette by index. */
export function toneFor(relationTo?: string | null, index = 0): Tone {
  if (relationTo && CONTENT_TYPE_TONE[relationTo]) return CONTENT_TYPE_TONE[relationTo]
  const cycle: Tone[] = ['crimson', 'indigo', 'magenta', 'emerald', 'violet', 'azure']
  return cycle[index % cycle.length]
}

interface GradientPanelProps {
  tone?: Tone
  /** Use the signature green featured panel instead of a content-type tone. */
  featured?: boolean
  className?: string
  /** Animate the field brighter/larger on parent group hover. */
  interactive?: boolean
  children?: ReactNode
}

/**
 * A gradient field + grain + scrim, sized by the parent. Position the parent
 * `relative` and give it a height/aspect ratio; this fills it absolutely behind
 * any foreground content passed as children.
 */
export function GradientPanel({
  tone = 'crimson',
  featured = false,
  className,
  interactive = false,
  children,
}: GradientPanelProps): JSX.Element {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 scale-105',
          interactive &&
            'transition-transform duration-[1200ms] ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-105',
        )}
        style={{ backgroundImage: featured ? FEATURED_PANEL : TONE[tone] }}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />
      {children}
    </div>
  )
}

export default GradientPanel
