import { iso } from '@/components/iso/iso'
import '@/components/solutions/solutionsFrame.css'
import type { JSX } from 'react'

/**
 * The figure beside "How we operate" — one plate per operating principle, stacked.
 *
 * It answers the section's own sentence ("a centralized institution built for lasting
 * quality"): the principles are not five separate things, they are courses of one
 * structure. Which is also the section's stated problem — the old layout showed five
 * equal bullets with nothing indicating they were connected.
 *
 * It is ONE figure that responds rather than five bespoke scenes, deliberately. These
 * principles are abstract ("deliberately built talent", "a culture of leadership"), and
 * inventing a distinct metaphor for each would be five pieces of visual argument the
 * copy does not make. A stack that builds as you read down makes only the claim the
 * heading already makes.
 *
 * Server-rendered: `iso` builds a string, so this ships no JavaScript. Which plate is
 * lit is decided in CSS from `data-active` on the section — see processJourney.css.
 */
export default function ProcessFigure({ count }: { count: number }): JSX.Element {
  const g = iso(2.5, 26)
  const R = 3
  const SPAN = 26
  const STEP = 11

  // The ground the whole thing is built on.
  for (let i = -SPAN; i <= SPAN; i += 13) {
    g.line([i, -SPAN, 0], [i, SPAN, 0], 'ink faint')
    g.line([-SPAN, i, 0], [SPAN, i, 0], 'ink faint')
  }
  g.face(0, 0, 0, SPAN, SPAN, R, 'ink')

  // Bottom course first: each plate's occluder has to cover the one beneath it.
  for (let i = 0; i < count; i++) {
    g.open(`pj-plate pj-p${i}`)
    g.box(0, 0, 4 + i * STEP, 19, 19, 3.4, R, 'ink')
    g.close()
  }

  /* viewBox is the figure's measured extents plus 8px. Guessing it clipped the base plate
     and let the ground grid run out of frame. */
  return (
    <svg viewBox="-138 53 276 256" fill="none" aria-hidden className="sf-svg sf-solo pj-fig">
      <g dangerouslySetInnerHTML={{ __html: g.done() }} />
    </svg>
  )
}
