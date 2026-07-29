import type { JSX } from 'react'
import { THESIS_EDGES, THESIS_NODES, WAY_EDGES, WAY_STATES, edgePath } from './systems'

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
 * Thesis — the field the camera travels through. Seven anchors, one per statement; the engine
 * scales and pans the whole group so scrolling the section moves through the system, and marks
 * the anchor belonging to the statement being read.
 */
export function ThesisSystem(): JSX.Element {
  return (
    <svg aria-hidden data-ax="thesis-system" className="ax-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" focusable="false">
      <g data-ax-camera>
        {THESIS_EDGES.map(([a, b], i) => (
          <path
            key={`e${i}`}
            id={`ax-th-${i}`}
            className={i < 6 ? 'ax-edge' : 'ax-edge ax-edge-faint'}
            d={edgePath(THESIS_NODES[a], THESIS_NODES[b])}
          />
        ))}
        {THESIS_NODES.map((p, i) => (
          <g key={`n${i}`} data-ax-anchor={i}>
            <circle className="ax-node-ring" cx={p.x} cy={p.y} r="3.4" opacity="0" />
            <circle className="ax-node" cx={p.x} cy={p.y} r="1.5" />
          </g>
        ))}
        {/* Signals ride the spokes. Green, and only here. */}
        {[0, 2, 4].map((i) => (
          <circle key={`s${i}`} className="ax-signal" data-ax-signal={`ax-th-${i}`} r="1" cx="0" cy="0" opacity="0" />
        ))}
      </g>
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
