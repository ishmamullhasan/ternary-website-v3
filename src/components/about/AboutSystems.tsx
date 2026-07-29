import type { JSX } from 'react'
import { WAY_EDGES, WAY_STATES, edgePath } from './systems'

/**
 * The page's system graphics, server-rendered as plain SVG.
 *
 * None of them animate on their own — AboutExperience finds them by `data-ax` and drives the
 * drawing, the camera, the morph and the signals. On their own they are a static frame, which
 * is exactly what a visitor without JavaScript or with reduced motion gets: a legible diagram
 * rather than an empty box.
 *
 * All are `aria-hidden` and state nothing in words, so nothing is lost when they are still.
 * Palette is grey lines and warm-white nodes, with the restrained green reserved for live
 * signals only.
 */

/** Hero — a technical field of grid lines and points. Draws in, drifts, responds to the cursor. */
export function HeroField(): JSX.Element {
  const cols = [6, 14, 23, 31, 42, 50, 58, 69, 77, 86, 94]
  const rows = [12, 26, 41, 55, 70, 84]
  const points = [
    { x: 14, y: 26 },
    { x: 42, y: 12 },
    { x: 69, y: 41 },
    { x: 86, y: 26 },
    { x: 23, y: 70 },
    { x: 58, y: 84 },
    { x: 94, y: 70 },
  ]

  return (
    <svg aria-hidden data-ax="field" className="ax-svg ax-grid" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
      <g data-ax-field-lines>
        {cols.map((x) => (
          <line key={`c${x}`} x1={x} y1="0" x2={x} y2="100" />
        ))}
        {rows.map((y) => (
          <line key={`r${y}`} x1="0" y1={y} x2="100" y2={y} />
        ))}
      </g>
      {/* Points sit above the grid and take the cursor parallax. */}
      <g data-ax-field-points>
        {points.map((p, i) => (
          <circle key={i} className="ax-node" cx={p.x} cy={p.y} r="0.45" opacity="0.75" />
        ))}
      </g>
    </svg>
  )
}

/**
 * Thesis — a restrained line system for the far-right canvas.
 *
 * REPLACES a full-bleed node field that sat behind the column and put circles and connections
 * straight over the headline and body copy. This has no geometry outside its strip.
 */
export function ThesisSystem(): JSX.Element {
  // One curve and one node per thesis. The curves are shallow and vertical, so the whole system
  // reads as a column of quiet activity rather than a diagram competing for attention.
  //
  // viewBox is a tall strip (40 wide, 200 tall) and the element is clipped to the far-right
  // canvas, which begins at 70% of the right column — past where the copy can ever reach. The
  // graphic has no geometry over the text because it has no box there.
  //
  // Node radius is 1.3 in a 40-unit-wide box, and the canvas caps the SVG at 220px, so a node
  // can never paint wider than ~14px — inside the 18px ceiling at every viewport. Curve opacity is set in CSS and
  // stays in the 0.08–0.18 band; only a live node reaches 0.8.
  const curves = [
    'M 6 12 C 22 26, 22 38, 8 52',
    'M 8 46 C 26 60, 24 74, 10 88',
    'M 10 82 C 28 96, 26 110, 12 124',
    'M 12 118 C 30 132, 28 146, 14 160',
    'M 14 154 C 32 166, 30 178, 16 190',
    'M 4 24 C 18 44, 16 70, 6 96',
  ]
  const nodes = [
    { x: 8, y: 52 },
    { x: 10, y: 88 },
    { x: 12, y: 124 },
    { x: 14, y: 160 },
    { x: 16, y: 190 },
    { x: 6, y: 12 },
  ]

  return (
    <svg
      aria-hidden
      data-ax="thesis-system"
      className="ax-svg"
      viewBox="0 0 40 200"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      {curves.map((d, i) => (
        <path key={`c${i}`} id={`ax-thc-${i}`} className="ax-th-curve" d={d} data-th-curve={i} />
      ))}
      {nodes.map((n, i) => (
        <circle key={`n${i}`} className="ax-th-node" data-th-node={i} cx={n.x} cy={n.y} r="1.3" />
      ))}
    </svg>
  )
}

/**
 * The Ternary Way — one living system that rearranges itself, replacing the static green panel
 * entirely. Nine nodes and twelve connections, painted here in state 0 (converging on a single
 * point); the engine interpolates every node between the five layouts and rebuilds the edges
 * each frame, so the system morphs rather than cutting between slides.
 */
export function WaySystem(): JSX.Element {
  const s0 = WAY_STATES[0]

  return (
    <svg aria-hidden data-ax="way-system" className="ax-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" focusable="false">
      <g data-ax-way-edges>
        {WAY_EDGES.map(([a, b], i) => (
          <path key={`we${i}`} id={`ax-way-${i}`} className="ax-edge" d={edgePath(s0[a], s0[b])} />
        ))}
      </g>
      <g data-ax-way-nodes>
        {s0.map((p, i) => (
          <circle key={`wn${i}`} className="ax-node" cx={p.x} cy={p.y} r={i === 8 ? 2.4 : 1.6} />
        ))}
      </g>
      {/* The hub's pulse, and the orbiting signal. */}
      <circle data-ax-way-ring className="ax-node-ring" cx={s0[8].x} cy={s0[8].y} r="5" opacity="0.5" />
      {[0, 3, 6].map((i) => (
        <circle key={`ws${i}`} className="ax-signal" data-ax-signal={`ax-way-${i}`} r="1.1" cx="0" cy="0" opacity="0" />
      ))}
    </svg>
  )
}

/**
 * Closing — the hero's field in a transformed final state, so the page reads as a loop: the
 * same grid, collapsed toward a single horizon line.
 */
export function ClosingField(): JSX.Element {
  const cols = [6, 14, 23, 31, 42, 50, 58, 69, 77, 86, 94]

  return (
    <svg aria-hidden data-ax="closing-field" className="ax-svg ax-grid" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
      <g data-ax-closing-lines>
        {cols.map((x) => (
          <line key={`cc${x}`} x1={x} y1="0" x2={x} y2="100" />
        ))}
        <line x1="0" y1="50" x2="100" y2="50" />
      </g>
    </svg>
  )
}
