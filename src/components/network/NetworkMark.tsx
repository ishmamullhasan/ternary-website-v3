import type { JSX } from 'react'
import './network.css'

/**
 * The Living Engineering Network — the capabilities hero.
 *
 * Replaces a stack of blocks. The page's claim is "Every discipline. One standard.", and
 * the disciplines behind it (AI, data, cloud, platforms, DevOps, IoT, experiences) are
 * interconnected practices, not objects sitting on each other. So the figure is a system:
 * one core, strands reaching out to where the work happens, and signals still moving.
 *
 * THE GEOMETRY IS THE ARGUMENT. Everything radiates from a single point — that is "one
 * standard" — and every strand ends somewhere different, which is "every discipline". A
 * first pass built this as a chain of nearest-neighbour links and it read as a mesh: lots
 * of connections, no centre, no claim.
 *
 * SERVER-RENDERED AND DETERMINISTIC. The layout comes from a fixed seed at module scope,
 * so the markup is byte-identical on server and client — a Math.random() scatter would
 * differ between them and hydrate mismatched. No JavaScript ships; every movement is CSS,
 * so it survives JS being off.
 *
 * NO filter: blur() ANYWHERE. Blurring a layer this size forces a full re-rasterise every
 * frame — that is what took the home CTA to 2.9fps. Glow is a radial gradient, already soft.
 */

const W = 620
const H = 520
const CX = W * 0.5
const CY = H * 0.5
const SPOKES = 13

function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}
const rnd = seeded(20240617)

const pt = (a: number, r: number, sx = 1.06, sy = 0.86): [number, number] => [
  +(CX + Math.cos(a) * r * sx).toFixed(1),
  +(CY + Math.sin(a) * r * sy).toFixed(1),
]

type Strand = { d: string; end: [number, number]; mid: [number, number]; r: number; ring: boolean; accent: boolean }

/* Each strand leaves the core and sweeps outward. Two control points, rotated in opposite
   directions, are what bend it into an S rather than a straight spoke — a radial burst of
   straight lines reads as a sunburst, which is decoration; a curve reads as a route. */
const strands: Strand[] = Array.from({ length: SPOKES }, (_, i) => {
  const a = (i / SPOKES) * Math.PI * 2 + 0.42
  const reach = 150 + rnd() * 108
  const swing = (rnd() - 0.5) * 1.5
  const start = pt(a, 16)
  const c1 = pt(a + swing * 0.55, reach * 0.42)
  const c2 = pt(a - swing * 0.42, reach * 0.78)
  const end = pt(a + swing * 0.16, reach)
  const mid = pt(a + swing * 0.3, reach * 0.62)
  return {
    d: `M${start[0]},${start[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${end[0]},${end[1]}`,
    end,
    mid,
    r: +(1.5 + rnd() * 2.4).toFixed(2),
    ring: i % 3 === 1,
    accent: i % 5 === 2,
  }
})

/* A second family: long arcs that SWEEP PAST the core instead of leaving it. Without
   these every line radiated from the centre at an even angle and the figure read as a
   sunburst — symmetrical, mechanical, decorative. These cross the radial strands at
   angles nothing else in the field repeats, which is what makes it look grown rather
   than drawn. They start and end out at the rim, so the centre stays the brightest
   thing without being the only origin. */
const sweeps: string[] = Array.from({ length: 7 }, (_, i) => {
  const a0 = (i / 7) * Math.PI * 2 + 1.1
  const span = 2.0 + rnd() * 1.5
  const r0 = 170 + rnd() * 90
  const r1 = 170 + rnd() * 90
  const start = pt(a0, r0)
  const end = pt(a0 + span, r1)
  // pulled in close to the core, so each arc grazes it on the way through
  const c1 = pt(a0 + span * 0.3, 30 + rnd() * 70)
  const c2 = pt(a0 + span * 0.7, 30 + rnd() * 70)
  return `M${start[0]},${start[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${end[0]},${end[1]}`
})

/* Faint dotted ellipses through the field — orbits, not decoration: they give the strands
   something to cross so the space between them reads as depth rather than emptiness. */
const orbits = [0.46, 0.68, 0.92, 1.16].map((k, i) => ({
  rx: +(118 * k).toFixed(1),
  ry: +(96 * k).toFixed(1),
  rot: +(i * 23 - 12).toFixed(1),
  dash: i % 2 ? '1 9' : '1 6',
}))

/* Small dot-matrix patches at the edges — the quiet "measured" texture in the reference. */
const patches = [
  { x: 84, y: 96, c: 4, r: 3 },
  { x: 508, y: 128, c: 3, r: 4 },
  { x: 122, y: 404, c: 3, r: 3 },
  { x: 520, y: 396, c: 4, r: 3 },
]

/* Signals ride the longest strands: a pulse needs room to read as travel, not a blink.
   FIVE, not more. Isolated by measurement, these are the only expensive thing in the
   figure — animating `offset-distance` costs layout every frame, where the strands,
   nodes, orbits and grid together cost nothing measurable. Seven put scroll at 56fps
   against a 60fps page; five keeps the effect and most of the frame back. */
const routes = [...strands.map((s) => s.d), ...sweeps].sort((p, q) => q.length - p.length).slice(0, 5)

export default function NetworkMark(): JSX.Element {
  return (
    <div className="nw" aria-hidden>
      <span className="nw-bloom" />
      <span className="nw-grid" />

      <svg viewBox={`0 0 ${W} ${H}`} fill="none" className="nw-svg">
        <defs>
          <radialGradient id="nw-core">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="18%" stopColor="#ddd6fe" stopOpacity="0.55" />
            <stop offset="52%" stopColor="#8b5cf6" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nw-halo">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="nw-orbits">
          {orbits.map((o, i) => (
            <ellipse
              key={i}
              cx={CX}
              cy={CY}
              rx={o.rx}
              ry={o.ry}
              className="nw-orbit"
              strokeDasharray={o.dash}
              transform={`rotate(${o.rot} ${CX} ${CY})`}
              style={{ animationDelay: `${(-i * 4.1).toFixed(1)}s` }}
            />
          ))}
        </g>

        {/* One animation per PATCH, not per dot. Animating all 45 individually cost ~7fps
            of scroll for a shimmer nobody can resolve at this size; the group fades as a
            unit and looks identical. */}
        <g className="nw-patches">
          {patches.map((p, pi) => (
            <g key={pi} className="nw-patch" style={{ animationDelay: `${(-pi * 3.1).toFixed(1)}s` }}>
              {Array.from({ length: p.c * p.r }, (_, k) => (
                <circle
                  key={k}
                  cx={p.x + (k % p.c) * 9}
                  cy={p.y + Math.floor(k / p.c) * 9}
                  r="0.85"
                  className="nw-dot"
                />
              ))}
            </g>
          ))}
        </g>

        <g className="nw-strands">
          {sweeps.map((d, i) => (
            <path
              key={`s${i}`}
              d={d}
              className="nw-edge is-sweep"
              style={{ animationDelay: `${(-i * 1.9).toFixed(1)}s` }}
            />
          ))}
          {strands.map((s, i) => (
            <path key={i} d={s.d} className="nw-edge" style={{ animationDelay: `${(-i * 1.1).toFixed(1)}s` }} />
          ))}
        </g>

        {/* Signals. `offset-path` takes SINGLE quotes inside the value — double quotes
            terminate the attribute early and strand every dot at its path origin. */}
        <g className="nw-signals">
          {routes.map((d, i) => (
            <circle
              key={i}
              r="1.9"
              className="nw-signal"
              style={{ offsetPath: `path('${d}')`, animationDelay: `${(-i * 2.6).toFixed(1)}s` }}
            />
          ))}
        </g>

        {/* The core. Small and intense rather than a broad wash — a large soft blob swallows
            the strands nearest it and the figure loses the point it hangs off. */}
        <circle cx={CX} cy={CY} r="104" fill="url(#nw-core)" className="nw-heart" />
        <circle cx={CX} cy={CY} r="4.6" className="nw-core-dot" />

        <g className="nw-nodes">
          {strands.map((s, i) => (
            <g key={i}>
              {s.accent && <circle cx={s.end[0]} cy={s.end[1]} r="22" fill="url(#nw-halo)" className="nw-glow" />}
              <circle cx={s.mid[0]} cy={s.mid[1]} r="1.1" className="nw-node is-quiet" />
              <circle
                cx={s.end[0]}
                cy={s.end[1]}
                r={s.r}
                className={`nw-node${s.accent ? ' is-accent' : ''}`}
                style={{ animationDelay: `${(-i * 0.79).toFixed(2)}s` }}
              />
              {s.ring && <circle cx={s.end[0]} cy={s.end[1]} r={s.r + 6} className="nw-ring" />}
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
