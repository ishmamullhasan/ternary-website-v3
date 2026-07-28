import { iso } from '@/components/iso/iso'
import '@/components/solutions/solutionsFrame.css'
import type { JSX } from 'react'

/**
 * The capabilities hero figure — eight disciplines, one standard, drawn.
 *
 * Deliberately the inverse of the solutions hero, which is four plates at four
 * different HEIGHTS over one ground: four different ways in. Here eight plates
 * ring the plane at exactly one height. Same construction system, opposite
 * statement — the page's own headline is "Every discipline. One standard.", and
 * a set of things sharing a level is what that looks like.
 *
 * Server-rendered: `iso` builds a string, so this ships no JavaScript. It reuses
 * solutionsFrame.css for the ink stroke language rather than restating it, which
 * is also what keeps the figure identical in weight to the ones on /solutions.
 */
function eightOnOnePlane(): string {
  const g = iso(3.1, 26)
  const R = 3
  const SPAN = 30
  const RING = 19

  // The plane every discipline is held to. Ruled rather than filled: you can see
  // through it, which keeps a large shape from becoming a heavy one.
  for (let i = -SPAN; i <= SPAN; i += 10) {
    g.line([i, -SPAN, 0], [i, SPAN, 0], 'ink faint')
    g.line([-SPAN, i, 0], [SPAN, i, 0], 'ink faint')
  }
  g.face(0, 0, 0, SPAN, SPAN, R, 'ink')

  // Eight plates on a ring, painted back to front so each occluder covers what
  // is behind it — in this projection that is ascending x + y.
  const plates = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8
    return { x: Math.cos(a) * RING, y: Math.sin(a) * RING, i }
  }).sort((p, q) => p.x + p.y - (q.x + q.y))

  for (const { x, y, i } of plates) {
    g.open('sf-drift', `animation-delay:${(-i * 1.1).toFixed(1)}s`)
    g.box(x, y, 3, 5, 5, 1.6, 2, 'ink')
    g.close()
  }

  return g.done()
}

/* viewBox is the figure's measured extents plus 8px — not a guessed box, which left
   ~47px of blank space above the plane and clipped the near plate at the bottom. */
export default function CapabilityHeroMark(): JSX.Element {
  return (
    <svg viewBox="-194 135 388 202" fill="none" aria-hidden className="sf-svg sf-solo sf-hero">
      <g dangerouslySetInnerHTML={{ __html: eightOnOnePlane() }} />
    </svg>
  )
}
