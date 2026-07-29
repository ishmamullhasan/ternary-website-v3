import type { JSX } from 'react'

/**
 * The page's two abstract graphics. Both are monochrome by design — cream strokes at low alpha
 * on the page ground — because the brand's colour lives in the section plates, and the interest
 * here is meant to come from structure and movement rather than from hue.
 *
 * Both are `aria-hidden` and state nothing. They carry no information a reader needs, so losing
 * them under reduced motion (where they render as a static frame) costs nothing.
 *
 * Neither animates on its own. AboutScene finds them by `data-anim` and drives the drawing,
 * the breathing and the signals; on their own they are just static SVG, which is exactly what a
 * visitor without JavaScript gets.
 */

/**
 * Hero — a technical grid. Lines draw in on entry, then the whole field drifts slowly against
 * the scroll, so the headline sits on something that is moving rather than on flat black.
 *
 * Deliberately irregular: an even grid reads as a background texture and disappears. The uneven
 * column rhythm makes it read as a drawing.
 */
export function AboutGrid(): JSX.Element {
  const cols = [4, 12, 21, 33, 39, 52, 61, 74, 83, 88, 96]
  const rows = [18, 34, 52, 71, 86]

  return (
    <svg
      aria-hidden
      data-anim="grid"
      className="asc-grid pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      focusable="false"
    >
      {cols.map((x) => (
        <line key={`c${x}`} x1={x} y1="0" x2={x} y2="100" />
      ))}
      {rows.map((y) => (
        <line key={`r${y}`} x1="0" y1={y} x2="100" y2={y} />
      ))}
    </svg>
  )
}

/**
 * Our thesis — a node-and-connection diagram. The edges draw as the section is scrolled, the
 * nodes breathe out of phase with each other, and signals run the wires between them.
 *
 * The figure is an argument, not decoration: a set of separate points wired into one system,
 * with traffic actually moving across it. That is the section's claim about how Ternary works,
 * drawn rather than stated — and it states nothing in words, so it invents no content.
 *
 * viewBox is square and the strokes are non-scaling, so it holds up at any panel size.
 */
export function ThesisDiagram(): JSX.Element {
  // Edges are paths (not lines) so signals can be aligned to them via MotionPath.
  const edges = [
    { id: 'asc-e1', d: 'M 24 30 L 60 20' },
    { id: 'asc-e2', d: 'M 24 30 L 46 56' },
    { id: 'asc-e3', d: 'M 60 20 L 82 44' },
    { id: 'asc-e4', d: 'M 46 56 L 82 44' },
    { id: 'asc-e5', d: 'M 46 56 L 34 82' },
    { id: 'asc-e6', d: 'M 82 44 L 70 78' },
    { id: 'asc-e7', d: 'M 34 82 L 70 78' },
  ]
  const nodes = [
    { x: 24, y: 30 },
    { x: 60, y: 20 },
    { x: 46, y: 56 },
    { x: 82, y: 44 },
    { x: 34, y: 82 },
    { x: 70, y: 78 },
  ]
  // Only three signals: one per busy wire. More than that stops reading as traffic and starts
  // reading as a screensaver.
  const signals = ['asc-e1', 'asc-e4', 'asc-e7']

  return (
    <svg
      aria-hidden
      data-anim="diagram"
      className="asc-diagram h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      {edges.map((e) => (
        <path key={e.id} id={e.id} className="asc-edge" d={e.d} />
      ))}

      {/* Expanding rings on the two anchor nodes — the diagram's pulse. */}
      {[nodes[2], nodes[3]].map((n, i) => (
        <circle key={`ring${i}`} className="asc-node-ring" cx={n.x} cy={n.y} r={3} />
      ))}

      {nodes.map((n, i) => (
        <circle key={`n${i}`} className="asc-node" cx={n.x} cy={n.y} r={1.9} />
      ))}

      {signals.map((p, i) => (
        <circle key={`s${i}`} className="asc-signal" data-path={p} r={1.1} cx={0} cy={0} />
      ))}
    </svg>
  )
}
