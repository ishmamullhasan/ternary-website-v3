import { iso } from '@/components/iso/iso'
import '@/components/solutions/solutionsFrame.css'
import type { JSX } from 'react'

/**
 * The capabilities hero figure — nine columns of equal height, rising from one base.
 *
 * Set against the solutions hero deliberately. That figure is horizontal: separate
 * plates spread across a plane, every one at the same level — different ways in, held
 * to one standard. This turns the same construction on its side. Columns instead of
 * plates, rising instead of lying, rooted in a single base instead of ringing an open
 * plane. A capability is not a way in; it is depth you have actually built.
 *
 * Two choices carry the page's own claim, "Every discipline. One standard.":
 *
 *   • Every column is the SAME height. Varying them would have been the easy way to
 *     make the silhouette interesting, and it would have said some practices run
 *     deeper than others — the opposite of one standard.
 *   • They share one base. The standard is the thing underneath all of them, not a
 *     label applied to each.
 *
 * Server-rendered: `iso` builds a string, so this ships no JavaScript. It reuses
 * solutionsFrame.css for the ink stroke language rather than restating it, which is
 * what keeps every figure on the site identical in weight.
 */
function columnsOnOneBase(): string {
  const g = iso(3.0, 2)
  const R = 2
  const SPAN = 27
  const STEP = 13
  // Slim and tall so these read as columns rather than as a block of cubes — at a
  // squarer footprint the nine of them close up into one brick and the base
  // disappears behind them.
  const H = 21

  // The base every column stands on. Ruled, so it reads as ground rather than a slab.
  for (let i = -SPAN; i <= SPAN; i += 13) {
    g.line([i, -SPAN, 0], [i, SPAN, 0], 'ink faint')
    g.line([-SPAN, i, 0], [SPAN, i, 0], 'ink faint')
  }
  g.face(0, 0, 0, SPAN, SPAN, R, 'ink')

  // Nine columns on a 3x3, painted back to front — ascending x + y in this projection —
  // so each column's occluder hides the ones behind it and the block reads as solid.
  const cols: { x: number; y: number; i: number }[] = []
  for (let ix = -1; ix <= 1; ix++) {
    for (let iy = -1; iy <= 1; iy++) cols.push({ x: ix * STEP, y: iy * STEP, i: cols.length })
  }
  cols.sort((a, c) => a.x + a.y - (c.x + c.y))

  for (const { x, y, i } of cols) {
    // Breathes rather than lifts: `sf-drift` is transform-only, so nothing here is
    // visible only while an animation is mid-cycle.
    g.open('sf-drift', `animation-delay:${(-i * 0.9).toFixed(1)}s`)
    g.box(x, y, 1, 3.6, 3.6, H, R, 'ink')
    g.close()
  }

  return g.done()
}

/* viewBox is the figure's measured extents plus 8px — not a guessed box, which is how
   an earlier figure ended up carrying ~47px of blank space above it. */
export default function CapabilityHeroMark(): JSX.Element {
  return (
    <svg viewBox="-170 84 340 216" fill="none" aria-hidden className="sf-svg sf-solo sf-hero">
      <g dangerouslySetInnerHTML={{ __html: columnsOnOneBase() }} />
    </svg>
  )
}
