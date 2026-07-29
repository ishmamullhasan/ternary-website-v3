/**
 * Geometry for the About page's system graphics.
 *
 * Shared between the server-rendered SVG markup and the client engine that animates it, so the
 * two can never drift: the markup paints state 0, the engine interpolates between the same
 * arrays. Everything is in a 0–100 viewBox space.
 */

export type Pt = { x: number; y: number }

/** Node count is fixed across every Ternary Way state — the system morphs, it never re-forms. */
export const WAY_NODES = 9

/**
 * One layout per principle. The same nine points rearrange to argue each idea:
 *
 *  0 Absolute ownership      — everything draws toward one centre
 *  1 Transparent execution   — the full lattice, nothing hidden
 *  2 Proximity to impact     — the active cluster pulls close together
 *  3 Certified global hub    — two connected centres (New York, Dhaka)
 *  4 Three ways to engage    — three coordinated paths (Frame, Flow, Orchestra)
 */
export const WAY_STATES: Pt[][] = [
  // 0 — converging on one point
  [
    { x: 50, y: 50 },
    { x: 50, y: 22 },
    { x: 74, y: 34 },
    { x: 78, y: 62 },
    { x: 58, y: 80 },
    { x: 34, y: 78 },
    { x: 20, y: 56 },
    { x: 26, y: 30 },
    { x: 50, y: 50 },
  ],
  // 1 — open lattice, every connection visible
  [
    { x: 18, y: 20 },
    { x: 50, y: 14 },
    { x: 82, y: 20 },
    { x: 86, y: 50 },
    { x: 82, y: 80 },
    { x: 50, y: 86 },
    { x: 18, y: 80 },
    { x: 14, y: 50 },
    { x: 50, y: 50 },
  ],
  // 2 — drawn close, working near the work
  [
    { x: 40, y: 40 },
    { x: 52, y: 34 },
    { x: 62, y: 42 },
    { x: 64, y: 56 },
    { x: 54, y: 64 },
    { x: 42, y: 62 },
    { x: 34, y: 52 },
    { x: 38, y: 46 },
    { x: 50, y: 50 },
  ],
  // 3 — two centres, connected
  [
    { x: 26, y: 34 },
    { x: 26, y: 50 },
    { x: 26, y: 66 },
    { x: 38, y: 50 },
    { x: 62, y: 50 },
    { x: 74, y: 34 },
    { x: 74, y: 50 },
    { x: 74, y: 66 },
    { x: 50, y: 50 },
  ],
  // 4 — three coordinated paths
  [
    { x: 16, y: 26 },
    { x: 44, y: 26 },
    { x: 76, y: 26 },
    { x: 16, y: 52 },
    { x: 44, y: 52 },
    { x: 76, y: 52 },
    { x: 16, y: 78 },
    { x: 44, y: 78 },
    { x: 76, y: 78 },
  ],
]

/** Which nodes are wired to which. Fixed — only the positions move. */
export const WAY_EDGES: [number, number][] = [
  [8, 0],
  [8, 1],
  [8, 2],
  [8, 3],
  [8, 4],
  [8, 5],
  [8, 6],
  [8, 7],
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
]

/** Straight-line path between two points, for an SVG <path d>. */
export const edgePath = (a: Pt, b: Pt): string => `M ${a.x} ${a.y} L ${b.x} ${b.y}`

/** Linear interpolation between two layouts. */
export const lerpLayout = (a: Pt[], b: Pt[], t: number): Pt[] =>
  a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * t, y: p.y + (b[i].y - p.y) * t }))
