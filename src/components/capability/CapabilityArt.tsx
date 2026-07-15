import type { JSX, ReactNode } from 'react'
import { useId } from 'react'

import './capabilityArt.css'

/**
 * CapabilityArt — eight cards, one gesture each. The figure is chosen per capability by the
 * collection's `animation` field, exactly as SolutionFeature picks its aside panel off `widget`.
 *
 * Every figure is under ten marks, and the set is built in PAIRS — 01 diverges / 02 converges,
 * 05 rotates / 07 radiates — so the grid has a rhythm rather than eight loose drawings.
 *
 * Each figure is drawn at full strength and then masked: a flat 14% base plus a soft circle that
 * tracks the pointer in SVG user units. The drawing is latent and resolves where you look. The
 * pointer handler (capabilitiesComp.tsx) writes CSS custom properties and nothing else — no React
 * state, so moving the mouse never re-renders a card.
 *
 * These are decorative. They restate the discipline the card already names in text, so each <svg> is
 * `aria-hidden` and contributes nothing to the accessible name — the card's <h3> and excerpt carry
 * the meaning. Being decorative, they are also exempt from contrast requirements, which is what lets
 * the masked base sit as low as it does.
 */

export const CAPABILITY_ANIMATIONS = [
  'agentic',
  'neuralNet',
  'platform',
  'dataLanes',
  'pipeline',
  'surfaces',
  'telemetry',
  'migration',
] as const

export type CapabilityAnimation = (typeof CAPABILITY_ANIMATIONS)[number]

/**
 * The shared plate: one coordinate space, and the pointer mask.
 *
 * The ids MUST be per-instance. The desktop grid and the mobile carousel each render all eight
 * cards, so every figure exists twice in the document; a hard-coded id would be a duplicate, and
 * `url(#…)` would resolve to whichever copy came first — silently masking one card with another
 * card's spotlight. useId gives each instance its own.
 */
function Fig({ children }: { children: ReactNode }): JSX.Element {
  const uid = useId()
  const grad = `cap-g-${uid}`
  const mask = `cap-m-${uid}`

  return (
    <svg viewBox="0 0 240 190" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden className="cap-svg">
      <defs>
        <radialGradient id={grad}>
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.66" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="190">
          <rect x="0" y="0" width="240" height="190" fill="#fff" className="cap-base" />
          <circle cx="0" cy="0" r="72" fill={`url(#${grad})`} className="cap-spot" />
        </mask>
      </defs>
      <g mask={`url(#${mask})`}>
        {/* The whole figure leans away from the pointer. Barely. */}
        <g className="cap-par">{children}</g>
      </g>
    </svg>
  )
}

/* 01 · Agentic Architecture — one impulse, three agents. It diverges. */
function Agentic(): JSX.Element {
  const arcs = ['M46,95 C104,95 118,42 200,42', 'M46,95 C114,95 132,95 200,95', 'M46,95 C104,95 118,148 200,148']

  return (
    <Fig>
      {arcs.map((d) => (
        <path key={d} d={d} className="ink" />
      ))}

      <g className="cap-origin">
        <circle cx="46" cy="95" r="3.4" className="solid" />
      </g>

      {arcs.map((d, i) => (
        <g
          key={`send-${d}`}
          className="cap-send"
          style={{ offsetPath: `path("${d}")`, animationDelay: `${i * -0.06}s` }}
        >
          <circle r="2.6" className="solid" />
        </g>
      ))}
    </Fig>
  )
}

/* 02 · Artificial Intelligence — the canonical feed-forward net: three fully-connected layers of
   nodes, with signals propagating left→right through the graph. Still reads as convergence toward
   the output, the deliberate inverse of 01's divergence — just drawn as a network, not lone arcs.

   This is the one figure that runs past the set's "under ten marks" budget: a neural net only reads
   as one once the edges actually mesh, so the fully-connected lattice is the whole point here. */
function NeuralNet(): JSX.Element {
  const uid = useId()
  const hotGrad = `cap-nn-g-${uid}`
  const hotMask = `cap-nn-m-${uid}`

  // Node layers, laid left → right and kept symmetric around y=95.
  const layers = [
    { x: 50, ys: [44, 78, 112, 146] },
    { x: 120, ys: [39, 67, 95, 123, 151] },
    { x: 190, ys: [69, 121] },
  ]

  // Every edge between adjacent layers — the dense mesh is what makes it read as a network.
  const edges: string[] = []
  for (let l = 0; l < layers.length - 1; l += 1) {
    for (const ay of layers[l].ys)
      for (const by of layers[l + 1].ys) edges.push(`M${layers[l].x},${ay} L${layers[l + 1].x},${by}`)
  }
  const nodes = layers.flatMap((layer) => layer.ys.map((y) => ({ x: layer.x, y })))

  // Ambient propagation: full input→hidden→output routes carry a travelling pulse so the net reads
  // as firing even before the pointer arrives. offset-distance is a percentage, so every route
  // takes the same time regardless of its length.
  const routes = [
    'M50,44 L120,39 L190,69',
    'M50,78 L120,67 L190,69',
    'M50,112 L120,95 L190,121',
    'M50,146 L120,123 L190,121',
    'M50,78 L120,95 L190,69',
  ]

  return (
    <Fig>
      <defs>
        {/* A tight spot, brighter and smaller than Fig's own — this is the activation the cursor
            carries, not the latent reveal. */}
        <radialGradient id={hotGrad}>
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={hotMask} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="190">
          <circle cx="0" cy="0" r="50" fill={`url(#${hotGrad})`} className="cap-hot" />
        </mask>
      </defs>

      {/* Base net — faint edges + nodes, always present. */}
      {edges.map((d) => (
        <path key={d} d={d} className="ink faint" />
      ))}

      {routes.map((d, i) => (
        <g
          key={`sig-${d}`}
          className="cap-infer"
          style={{ offsetPath: `path("${d}")`, animationDelay: `${i * -0.5}s` }}
        >
          <circle r="2.1" className="solid" />
        </g>
      ))}

      {nodes.map((n) => (
        <circle key={`n-${n.x}-${n.y}`} cx={n.x} cy={n.y} r="3" className="solid" />
      ))}

      {/* Cursor activation — a bright copy of the whole net, revealed only in the tight spot that
          tracks the pointer directly. Moving the cursor drags the live activation across the graph:
          the neurons and edges you point at fire, in real time, following the cursor rather than a
          clock. Snappy transition (see .cap-hot) so it reads as direct control. */}
      <g mask={`url(#${hotMask})`}>
        {edges.map((d) => (
          <path key={`hot-${d}`} d={d} className="hi" />
        ))}
        {nodes.map((n) => (
          <circle key={`hot-n-${n.x}-${n.y}`} cx={n.x} cy={n.y} r="3.6" className="solid" />
        ))}
      </g>

      {/* The probe rides the cursor exactly — the input you are holding over the network, pulsing. */}
      <g className="cap-probe">
        <circle r="3.2" className="solid" />
        <circle r="3.2" className="cap-probe-ring" />
      </g>
    </Fig>
  )
}

/* 03 · Platformization — it draws itself, bottom up, and holds. */
function Platform(): JSX.Element {
  const bars = [
    { y: 142, w: 152, cls: 'hi' },
    { y: 116, w: 122, cls: 'ink' },
    { y: 90, w: 94, cls: 'ink' },
    { y: 64, w: 62, cls: 'ink' },
  ]

  return (
    <Fig>
      {bars.map((b, i) => (
        // pathLength normalises every bar to 1 unit long, so one dashoffset keyframe draws all four
        // at the same rate regardless of their differing widths.
        <path
          key={b.y}
          d={`M44,${b.y} h${b.w}`}
          pathLength="1"
          strokeDasharray="1"
          className={`cap-draw ${b.cls}`}
          style={{ animationDelay: `${i * 0.34}s` }}
        />
      ))}
    </Fig>
  )
}

/* 04 · Data & Analytics — one continuous stream, and the cursor is yours. The wave period is exactly
   60px and the scroll is exactly -60px, so the loop closes on itself: no crossfade is hiding a seam,
   because there is no seam. */
function DataLanes(): JSX.Element {
  const clip = `cap-c-${useId()}`

  const lane = (amp: number, harmonic: number, offset: number): string => {
    let d = ''
    for (let x = 0; x <= 300; x += 3) {
      const t = (x / 60) * Math.PI * 2 // period exactly 60px
      const y = offset + Math.sin(t) * amp + Math.sin(t * harmonic + 0.9) * amp * 0.38
      d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(2)}`
    }
    return d
  }

  return (
    <Fig>
      <defs>
        <clipPath id={clip}>
          <rect x="26" y="0" width="188" height="190" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clip})`}>
        {/* cap-amp scales the trace vertically with the pointer's height: the reading answers to
            where you hold the cursor. */}
        <g className="cap-amp">
          <g className="cap-lane-b">
            <path d={lane(14, 2, 108)} className="ink faint" />
          </g>
          <g className="cap-lane-a">
            <path d={lane(22, 3, 84)} className="hi" />
          </g>
        </g>
      </g>

      {/* The scope line IS the cursor — it tracks the pointer's x in user units. */}
      <g className="cap-scope">
        <path d="M120,30 v130" className="ink" />
      </g>
    </Fig>
  )
}

/* 05 · DevOps & Automation — two arcs chasing, counter-rotating. Nothing ever completes. */
function Pipeline(): JSX.Element {
  const circumference = (r: number): number => 2 * Math.PI * r

  return (
    <Fig>
      <circle
        cx="120"
        cy="95"
        r="54"
        className="hi cap-turn"
        strokeDasharray={`${(circumference(54) * 0.42).toFixed(1)} ${(circumference(54) * 0.58).toFixed(1)}`}
      />
      <circle
        cx="120"
        cy="95"
        r="34"
        className="ink cap-turn-b"
        strokeDasharray={`${(circumference(34) * 0.28).toFixed(1)} ${(circumference(34) * 0.72).toFixed(1)}`}
      />
    </Fig>
  )
}

/* 06 · Digital Experiences — one surface, every device. The frame morphs phone → tablet → desktop
   and its content reflows with it, on the same clock. */
function Surfaces(): JSX.Element {
  return (
    <Fig>
      <rect className="hi cap-surface" x="104" y="34" width="32" height="122" rx="6" />
      <rect className="ink cap-content" x="112" y="52" width="16" height="30" rx="2" />
    </Fig>
  )
}

/* 07 · Internet of Things — a thing on an edge, reporting. It radiates: the deliberate inverse of
   05's rotation. */
function Telemetry(): JSX.Element {
  return (
    <Fig>
      <path d="M26,140 h188" className="ink faint" />

      {[0, 1, 2].map((i) => (
        <ellipse
          key={i}
          cx="120"
          cy="140"
          rx="18"
          ry="6"
          className="hi cap-radiate"
          style={{ animationDelay: `${i * -1.5}s` }}
        />
      ))}

      <circle cx="120" cy="140" r="3.2" className="solid" />
      <path d="M120,137 v-22" className="ink" />
      <circle cx="120" cy="112" r="2" className="solid cap-beat" />
    </Fig>
  )
}

/* 08 · Cloud Transformation — the block, leaving. The dashed outline is what it left behind. */
function Migration(): JSX.Element {
  return (
    <Fig>
      <rect x="88" y="48" width="64" height="94" rx="2" className="ink dash" />

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x="88"
          y={50 + i * 15}
          width="64"
          height="9"
          rx="1"
          className="solid cap-lift"
          style={{ animationDelay: `${i * -1.15}s` }}
        />
      ))}
    </Fig>
  )
}

const FIGURES: Record<CapabilityAnimation, () => JSX.Element> = {
  agentic: Agentic,
  neuralNet: NeuralNet,
  platform: Platform,
  dataLanes: DataLanes,
  pipeline: Pipeline,
  surfaces: Surfaces,
  telemetry: Telemetry,
  migration: Migration,
}

/**
 * Renders the figure the capability selected. An unset or unrecognised key renders nothing rather
 * than a default figure: an arbitrary gesture on a card it does not describe is worse than a plain
 * card, and the card is designed to hold its own without art.
 */
export default function CapabilityArt({ animation }: { animation?: string | null }): JSX.Element | null {
  const Figure = animation ? FIGURES[animation as CapabilityAnimation] : undefined
  if (!Figure) return null
  return <Figure />
}
