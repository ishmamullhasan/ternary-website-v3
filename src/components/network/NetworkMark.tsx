import type { JSX } from 'react'
import './network.css'

/**
 * The capabilities hero — an engineering mesh with circuit routing through it.
 *
 * WHY IT LOOKS LIKE THIS. The previous version was curved strands radiating from a bright
 * core, and the honest read on it was "orbital mechanics", not software. Curves and haloed
 * points are the visual language of astronomy. What reads as engineering is orthogonal and
 * 45-degree routing, pads, vias, a computational core — the language of a board, a
 * topology, a dependency graph. So nothing here is a free curve: every trace is routed.
 *
 * THE GEOMETRY IS THE ARGUMENT. One core, one continuous mesh, every module wired back
 * into it — "Every discipline. One standard." The mesh is a single fabric rather than
 * scattered nodes, which is the part the earlier passes never managed to say.
 *
 * DENSITY IS CHEAP, MOTION IS NOT. Measured on the previous build: 20 strands, 13 nodes,
 * 4 orbits, a masked grid and gradients together cost nothing detectable, while the
 * travelling signals alone took scroll from 60 to 56fps — `offset-distance` is the one
 * expensive property. So this spends freely on static geometry (~300 mesh segments, ~120
 * junctions) and keeps only THREE signals.
 *
 * SERVER-RENDERED AND DETERMINISTIC. Layout comes from a fixed LCG seed at module scope,
 * so the markup is byte-identical on server and client; Math.random() would differ between
 * them and hydrate mismatched. No JavaScript ships — every movement is CSS.
 *
 * NO filter: blur() ANYWHERE — that is what took the home CTA to 2.9fps.
 */

const W = 640
const H = 540
const CX = W / 2
const CY = H / 2

function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}
const rnd = seeded(7314159)
const n1 = (v: number): string => v.toFixed(1)

/* ── the fabric ────────────────────────────────────────────────────────────
   A jittered lattice, not a grid: a true grid reads as graph paper, pure scatter reads as
   noise. Jitter keeps the cells irregular the way a real mesh is; the lattice keeps it a
   single connected fabric. */
const STEP = 47
const COLS = Math.ceil(W / STEP) + 1
const ROWS = Math.ceil(H / STEP) + 1

type P = { x: number; y: number; d: number }
const grid: P[][] = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => {
    const x = c * STEP + (rnd() - 0.5) * STEP * 0.55
    const y = r * STEP + (rnd() - 0.5) * STEP * 0.55
    return { x: +x.toFixed(1), y: +y.toFixed(1), d: Math.hypot(x - CX, y - CY) }
  }),
)

/* Edges right, down, and one diagonal — quads broken by triangles, which is what gives a
   finite-element mesh its look rather than a plain net. */
const mesh: string[] = []
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const a = grid[r][c]
    if (c + 1 < COLS) mesh.push(`M${a.x},${a.y}L${grid[r][c + 1].x},${grid[r][c + 1].y}`)
    if (r + 1 < ROWS) mesh.push(`M${a.x},${a.y}L${grid[r + 1][c].x},${grid[r + 1][c].y}`)
    if (r + 1 < ROWS && c + 1 < COLS && (r + c) % 2 === 0)
      mesh.push(`M${a.x},${a.y}L${grid[r + 1][c + 1].x},${grid[r + 1][c + 1].y}`)
  }
}

/* Junctions: only points near the core are drawn, so the fabric reads dense in the middle
   and thins outward on its own. */
const junctions = grid.flat().filter((p) => p.d < 250 && rnd() > 0.42)

/* ── circuit routing ───────────────────────────────────────────────────────
   Manhattan with a 45-degree chamfer: run along the dominant axis, cut the corner at 45,
   finish on the other. This one rule is what makes the figure read as a board instead of
   a constellation — no segment sits at an arbitrary angle. */
function route(x0: number, y0: number, x1: number, y1: number): string {
  const dx = x1 - x0
  const dy = y1 - y0
  const sx = Math.sign(dx)
  const sy = Math.sign(dy)
  const diag = Math.min(Math.abs(dx), Math.abs(dy))
  if (Math.abs(dx) >= Math.abs(dy)) {
    const bx = x0 + sx * (Math.abs(dx) - diag)
    return `M${n1(x0)},${n1(y0)} L${n1(bx)},${n1(y0)} L${n1(bx + sx * diag)},${n1(y0 + sy * diag)} L${n1(x1)},${n1(y1)}`
  }
  const by = y0 + sy * (Math.abs(dy) - diag)
  return `M${n1(x0)},${n1(y0)} L${n1(x0)},${n1(by)} L${n1(x0 + sx * diag)},${n1(by + sy * diag)} L${n1(x1)},${n1(y1)}`
}

const MODULES = 12
const modules = Array.from({ length: MODULES }, (_, i) => {
  const a = (i / MODULES) * Math.PI * 2 + 0.3
  const reach = 172 + rnd() * 74
  const x = +(CX + Math.cos(a) * reach * 1.08).toFixed(1)
  const y = +(CY + Math.sin(a) * reach * 0.84).toFixed(1)
  const big = i % 3 === 0
  return {
    x,
    y,
    w: big ? 17 : 10,
    h: big ? 12 : 8,
    d: route(CX + Math.cos(a) * 26, CY + Math.sin(a) * 20, x, y),
    live: i % 4 === 1,
    i,
  }
})

/* Vias — small squares punched through the fabric, the way a board is punctuated by holes. */
const vias = grid
  .flat()
  .filter((p) => p.d > 90 && p.d < 235 && rnd() > 0.9)
  .slice(0, 14)

/* THREE signal routes. Not more — see the density note above. */
const routes = modules.filter((m) => m.live).slice(0, 3)

export default function NetworkMark(): JSX.Element {
  return (
    <div className="nw" aria-hidden>
      <span className="nw-bloom" />

      <svg viewBox={`0 0 ${W} ${H}`} fill="none" className="nw-svg">
        <defs>
          <radialGradient id="nw-core">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#ddd6fe" stopOpacity="0.34" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          {/* The fabric fades outward here rather than being clipped — a mesh with an edge
              reads as a swatch of material, one that dissolves reads as depth. */}
          <radialGradient id="nw-fade">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="52%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="nw-mask">
            <rect x="0" y="0" width={W} height={H} fill="url(#nw-fade)" />
          </mask>
        </defs>

        <g mask="url(#nw-mask)">
          <g className="nw-mesh">
            {mesh.map((d, i) => (
              <path key={i} d={d} className="nw-cell" />
            ))}
          </g>

          {/* A few cells hold light, then hand off — the fabric is being used, not merely
              present. Eight animations, not three hundred. */}
          <g className="nw-active">
            {mesh
              .filter((_, i) => i % 37 === 5)
              .slice(0, 8)
              .map((d, i) => (
                <path
                  key={i}
                  d={d}
                  className="nw-cell is-live"
                  style={{ animationDelay: `${(-i * 2.3).toFixed(1)}s` }}
                />
              ))}
          </g>

          <g className="nw-junctions">
            {junctions.map((p, i) => (
              <rect key={i} x={p.x - 0.9} y={p.y - 0.9} width="1.8" height="1.8" className="nw-junction" />
            ))}
          </g>

          <g className="nw-vias">
            {vias.map((p, i) => (
              <rect key={i} x={p.x - 2} y={p.y - 2} width="4" height="4" rx="0.6" className="nw-via" />
            ))}
          </g>
        </g>

        {/* Traces: routed, never curved. */}
        <g className="nw-traces">
          {modules.map((m) => (
            <path
              key={m.i}
              d={m.d}
              className={`nw-trace${m.live ? ' is-live' : ''}`}
              style={{ animationDelay: `${(-m.i * 1.6).toFixed(1)}s` }}
            />
          ))}
        </g>

        {/* Signals. `offset-path` needs SINGLE quotes inside the value — double quotes
            terminate the attribute early and strand every packet at its path origin. */}
        <g className="nw-signals">
          {routes.map((m, i) => (
            <rect
              key={i}
              x="-1.6"
              y="-1.1"
              width="3.2"
              height="2.2"
              className="nw-signal"
              style={{ offsetPath: `path('${m.d}')`, animationDelay: `${(-i * 3.7).toFixed(1)}s` }}
            />
          ))}
        </g>

        {/* Modules: pads, not points. */}
        <g className="nw-modules">
          {modules.map((m) => (
            <g key={m.i}>
              <rect
                x={m.x - m.w / 2}
                y={m.y - m.h / 2}
                width={m.w}
                height={m.h}
                rx="1.6"
                className={`nw-module${m.live ? ' is-live' : ''}`}
              />
              <rect x={m.x - m.w / 2 + 2.5} y={m.y - 0.5} width={m.w - 5} height="1" className="nw-module-pin" />
            </g>
          ))}
        </g>

        {/* The core: a computational block, not a star. The glow sits behind the geometry
            so the block stays legible instead of being swallowed by light. */}
        <circle cx={CX} cy={CY} r="112" fill="url(#nw-core)" className="nw-heart" />
        <rect x={CX - 26} y={CY - 20} width="52" height="40" rx="3" className="nw-core-block" />
        <rect x={CX - 16} y={CY - 11} width="32" height="22" rx="2" className="nw-core-die" />
        {[-1, 1].map((s) =>
          [0, 1, 2].map((k) => (
            <rect
              key={`${s}-${k}`}
              x={CX + s * 26 - (s > 0 ? 0 : 6)}
              y={CY - 9 + k * 9}
              width="6"
              height="1.4"
              className="nw-core-pin"
            />
          )),
        )}
      </svg>
    </div>
  )
}
