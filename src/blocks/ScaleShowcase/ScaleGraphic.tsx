'use client'

import { cn } from '@/lib/utils'
import { useReducedMotion } from 'motion/react'
import type { JSX } from 'react'
import { useId } from 'react'

import './scaleGraphic.css'

/**
 * ScaleGraphic — the motion figure that fills the right column of a scale section.
 *
 * Design intent (per tier): a composed engineering diagram breathing slowly, not a busy animation.
 * A single panel — muted indigo/violet ground + faint grain — with the figure drawn edge to edge in
 * a PORTRAIT viewBox and scaled to *cover* (preserveAspectRatio="xMidYMid slice"), so it fills the
 * column with no letterboxing and no box-inside-a-box.
 *
 * `tracks` (Scale 01 · Startups & Scale-ups) — three-to-four parallel delivery tracks spread across
 * the full height with layered depth (front brighter/thicker, back fainter/thinner), a dot travelling
 * each track at its own slow speed and staggered start so motion is continuous somewhere but never
 * synchronized, and an off-center 4-node "pod" cluster with a slow ambient pulse over a faint
 * background dot-field. 02 (`bands`) and 03 (`perimeter`) are scaffolded and will follow once 01 is
 * approved.
 *
 * Motion: SMIL <animateMotion> drives the travelling dots (follows the path in user units, so it
 * scales cleanly with the slice). The whole animated layer is gated on useReducedMotion() — motion-
 * sensitive users get the same composition as a still diagram. Decorative, so aria-hidden.
 */

const VB_W = 420
const VB_H = 580

export type ScaleGraphicVariant = 'tracks' | 'bands' | 'perimeter'

// Muted indigo/violet grounds, one per concept — same family, slightly shifted so the three tiers
// read as a set rather than three copies.
const GROUND: Record<ScaleGraphicVariant, string> = {
  tracks: 'radial-gradient(130% 130% at 28% 16%, #2a2452 0%, #171334 52%, #0b0a1c 100%)',
  bands: 'radial-gradient(130% 130% at 72% 14%, #2b2158 0%, #181235 52%, #0b091b 100%)',
  perimeter: 'radial-gradient(120% 120% at 50% 30%, #241f4c 0%, #151132 54%, #0a091a 100%)',
}

// Delivery tracks — varied length + vertical offset so the set reads organic, not a grid. Depth is
// carried by opacity + stroke width (front = brighter/thicker). Each dot gets its own duration and a
// negative begin (mid-loop start) so no two are in phase.
const TRACKS = [
  { d: 'M40,150 C150,132 252,138 392,126', o: 0.5, w: 1.7, r: 3.2, dur: 18, begin: -2 },
  { d: 'M96,250 C196,240 300,246 404,232', o: 0.3, w: 1.35, r: 2.8, dur: 22, begin: -9 },
  { d: 'M18,362 C112,352 214,358 316,344', o: 0.15, w: 1, r: 2.2, dur: 26, begin: -15 },
  { d: 'M120,470 C214,462 300,470 398,454', o: 0.22, w: 1.15, r: 2.6, dur: 20, begin: -5 },
] as const

// Off-center pod cluster (upper-left third) — four nodes + connective edges, an anchor point.
const POD_NODES = [
  [86, 96],
  [140, 110],
  [102, 150],
  [152, 156],
] as const
const POD_EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [0, 3],
] as const
const POD_CX = 120
const POD_CY = 128

function TracksFigure({ reduce }: { reduce: boolean }): JSX.Element {
  const uid = useId().replace(/[:]/g, '')
  const dots = `sg-dots-${uid}`
  const glow = `sg-glow-${uid}`

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <pattern id={dots} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.2" fill="#c7ccff" fillOpacity="0.06" />
        </pattern>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor="#c7ccff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#8b8ff0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8b8ff0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint background dot-field fills negative space without adding noise */}
      <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#${dots})`} />

      {/* pod anchor: pulsing halo + node graph, off-center upper-left */}
      <circle cx={POD_CX} cy={POD_CY} r="52" fill={`url(#${glow})`} className={reduce ? undefined : 'sg-pulse'} />
      <g stroke="#c7ccff" strokeOpacity="0.28" strokeWidth="1">
        {POD_EDGES.map(([a, b], i) => (
          <line key={i} x1={POD_NODES[a][0]} y1={POD_NODES[a][1]} x2={POD_NODES[b][0]} y2={POD_NODES[b][1]} />
        ))}
      </g>
      {POD_NODES.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.2" fill="#dfe3ff" className={reduce ? undefined : 'sg-node'} />
      ))}

      {/* delivery tracks — layered depth */}
      {TRACKS.map((t, i) => (
        <path key={`t${i}`} id={`${uid}-t${i}`} d={t.d} stroke="#c7ccff" strokeOpacity={t.o} strokeWidth={t.w} />
      ))}

      {/* travelling dots — one per track, continuous, staggered, non-synchronized */}
      {TRACKS.map((t, i) => (
        <g key={`d${i}`}>
          <circle r={t.r * 2.5} fill="#c7ccff" fillOpacity="0.14" />
          <circle r={t.r} fill="#eef0ff" fillOpacity="0.92" />
          {!reduce && (
            <animateMotion dur={`${t.dur}s`} begin={`${t.begin}s`} repeatCount="indefinite" calcMode="linear">
              <mpath href={`#${uid}-t${i}`} />
            </animateMotion>
          )}
        </g>
      ))}
    </svg>
  )
}

// Placeholder grounds for 02/03 until their compositions are built — kept minimal so the page never
// shows an empty box if wired early.
function ComingSoonFigure(): JSX.Element {
  return <span aria-hidden className="absolute inset-0" />
}

export default function ScaleGraphic({
  variant = 'tracks',
  className,
}: {
  variant?: ScaleGraphicVariant
  className?: string
}): JSX.Element {
  const reduce = useReducedMotion() ?? false

  return (
    <div
      aria-hidden
      className={cn('relative min-h-[24rem] overflow-hidden rounded-md ring-1 ring-line lg:min-h-0', className)}
    >
      {/* single panel: ground + grain, no inner box */}
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: GROUND[variant] }} />
      <span
        aria-hidden
        className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.14] mix-blend-overlay"
      />
      {variant === 'tracks' ? <TracksFigure reduce={reduce} /> : <ComingSoonFigure />}
    </div>
  )
}
