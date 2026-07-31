import type { JSX } from 'react'

/**
 * The Continuous Path — the /careers hero figure.
 *
 * The copy is about owning what you build after it ships, so the figure is a system that keeps
 * extending: Build → Deploy → Operate → Improve, drawn forward, then a signal running the finished
 * route, then one more segment growing out of the endpoint. It is deliberately NOT another network,
 * orbit, cube or particle field — those metaphors are already spoken for elsewhere on the site, and
 * each of them says "technology" in general rather than this page's actual argument.
 *
 * It is also not the staircase it replaces. A staircase says "progress"; four equal risers say
 * nothing about the work. This route runs mostly flat with three direction changes, and the third
 * one DROPS — operating a system is where it costs you — before the climb to the growing edge.
 *
 * NO JAVASCRIPT IN THIS COMPONENT. Everything below is static markup; the whole sequence is CSS in
 * careersHero.css, gated on `[data-seq='on']`, which HeroSequence sets on the hero wrapper. So the
 * base rendering — no JS, pre-hydration, reduced motion — is the completed path, standing still.
 * That is the same contract RevealText and the hub reveals are written to.
 *
 * Decorative: the whole svg is aria-hidden, which is also why the BUILD/DEPLOY/OPERATE/IMPROVE
 * annotations are safe here. They are painted glyphs inside a hidden figure, not page labels — a
 * screen reader is never handed them, and they are invisible at rest, appearing for well under a
 * second as the signal passes each node.
 */

type Pt = readonly [number, number]

const dist = (a: Pt, b: Pt): number => Math.hypot(b[0] - a[0], b[1] - a[1])
const runLength = (pts: readonly Pt[]): number => pts.slice(1).reduce((sum, p, i) => sum + dist(pts[i]!, p), 0)
const toPath = (pts: readonly Pt[]): string => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')
const round = (n: number): number => Math.round(n * 1000) / 1000

/* The route, in viewBox units. Three draw stages so the path can build in step with the three
   lines of the headline, then a branch that grows after the first signal completes. */
const SEG_A: readonly Pt[] = [
  [16, 226],
  [96, 226], // BUILD
  [160, 168],
  [240, 168], // DEPLOY
]
const SEG_B: readonly Pt[] = [
  [240, 168],
  [286, 194], // the drop
  [326, 194], // OPERATE
]
const SEG_C: readonly Pt[] = [
  [326, 194],
  [390, 92],
  [462, 92], // the endpoint — where the system keeps going
]
const BRANCH: readonly Pt[] = [
  [462, 92],
  [504, 56],
]

const SPINE: readonly Pt[] = [...SEG_A, ...SEG_B.slice(1), ...SEG_C.slice(1)]
const SIGNAL_ROUTE: readonly Pt[] = [...SPINE, BRANCH[1]!]

const SIGNAL_LENGTH = runLength(SIGNAL_ROUTE)

/* The signal crosses the whole route once per cycle at a constant rate, so the moment it reaches
   any node is that node's distance along the route as a fraction of the cycle. Derived rather than
   eyeballed: nudging a coordinate above re-times the annotations automatically instead of leaving
   them firing at the wrong points. */
const CYCLE = 5 // s — the "every 4–6 seconds" pulse
const SIGNAL_START = 2.6 // s — after the path has finished drawing

const arrivalAt = (index: number): number => {
  const reached = runLength(SIGNAL_ROUTE.slice(0, index + 1))
  return SIGNAL_START + (reached / SIGNAL_LENGTH) * CYCLE
}

/* Index into SIGNAL_ROUTE for each named node. */
const NODES = [
  { at: 1, label: 'Build' },
  { at: 3, label: 'Deploy' },
  { at: 5, label: 'Operate' },
  { at: 7, label: 'Improve' },
] as const

/* The branch is drawn just as the signal arrives at the endpoint, so the route visibly extends
   AHEAD of the signal rather than appearing behind it — the difference between a system that is
   growing and one that is looping. */
const BRANCH_AT = round(arrivalAt(NODES[3].at))

const STAGES = [
  { pts: SEG_A, delay: 0.3, dur: 0.85 },
  { pts: SEG_B, delay: 1.0, dur: 0.55 },
  { pts: SEG_C, delay: 1.45, dur: 0.75 },
] as const

/* 560px cap: the route's ink runs x16→x504 of a 520 viewBox, so it renders ~525px wide — 36% of a
   1440 hero, inside the 35–40% the figure is meant to occupy. At the previous 520 cap it measured
   33%, visibly shy of its column. The figure column itself is ~606px, so this still clears its own
   gutter. */
export default function ContinuousPath(): JSX.Element {
  return (
    <svg viewBox="0 0 520 260" fill="none" aria-hidden className="cp h-auto w-full max-w-[560px]">
      {/* The route at rest. */}
      {STAGES.map((stage, i) => (
        <path
          key={i}
          className="cp-seg"
          d={toPath(stage.pts)}
          style={
            {
              '--len': round(runLength(stage.pts)),
              '--delay': `${stage.delay}s`,
              '--dur': `${stage.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <path
        className="cp-seg cp-branch"
        d={toPath(BRANCH)}
        style={
          {
            '--len': round(runLength(BRANCH)),
            '--delay': `${BRANCH_AT}s`,
            '--dur': '0.45s',
          } as React.CSSProperties
        }
      />

      {/* The signal. A short dash travelling a full-length gap: one lit run sweeping the route each
          cycle, with no element to position and no motion path to resolve. The wider, fainter twin
          under it is the glow — a second stroke rather than a drop-shadow, because a filter on a
          permanently animating element costs real frames for something meant to be imperceptible. */}
      {(['cp-glow', 'cp-signal'] as const).map((cls) => (
        <path
          key={cls}
          className={cls}
          d={toPath(SIGNAL_ROUTE)}
          style={{ '--len': round(SIGNAL_LENGTH) } as React.CSSProperties}
        />
      ))}

      {NODES.map((node, i) => {
        const [x, y] = SIGNAL_ROUTE[node.at]!
        return (
          <g key={node.label}>
            <circle
              className="cp-node"
              cx={x}
              cy={y}
              r="3.25"
              style={{ '--delay': `${STAGES[Math.min(i, STAGES.length - 1)]!.delay + 0.35}s` } as React.CSSProperties}
            />
            <text
              className="cp-label"
              x={x - 1}
              y={y + 21}
              style={{ '--at': `${round(arrivalAt(node.at))}s` } as React.CSSProperties}
            >
              {node.label.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
