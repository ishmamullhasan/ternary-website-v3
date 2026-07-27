'use client'

import { useCallback, useRef, type JSX } from 'react'
import './solutionsFrame.css'

/**
 * SolutionsFrame — one wide field, four movements.
 *
 * Replaces the gradient hero above the solution cards. Each lane is a gesture that answers to its
 * solution: a point becomes a product; mass crosses without dropping anything; a team gains one;
 * and the last one never resolves — it catches, clears, and goes back to watching, because Managed
 * Services is the only engagement that doesn't finish.
 *
 * Lanes are bound to the cards below: hover or focus a card and its lane resolves while the others
 * recede (`focus`, owned by the parent so the cards stay the single source of truth). Purely
 * decorative — the cards carry every word — so the whole frame is aria-hidden.
 */

const MID = 210
const VIEW_W = 1200
const VIEW_H = 420
const BG = '#0F0E0E'

/* ── 01 · Product Development ────────────────────────────────────────────
   "conception to scale": a seed reaches out, a product surface draws itself,
   ships, and then becomes many. */
function Product(): JSX.Element {
  return (
    <g>
      <circle cx="-116" cy={MID} r="3.2" className="solid sf-seed" />
      <path d={`M-112,${MID} h34`} className="hi sf-reach" pathLength="1" strokeDasharray="1" />
      <rect
        x="-74"
        y={MID - 56}
        width="140"
        height="112"
        rx="5"
        className="hi sf-build"
        pathLength="1"
        strokeDasharray="1"
      />
      <path d={`M-74,${MID - 28} h140`} className="ink sf-detail" style={{ animationDelay: '2.3s' }} />
      <circle cx="-60" cy={MID - 42} r="2.6" className="solid sf-detail" style={{ animationDelay: '2.5s' }} />
      <path d={`M-56,${MID + 2} h72`} className="ink faint sf-detail" style={{ animationDelay: '2.7s' }} />
      <path d={`M-56,${MID + 24} h44`} className="ink faint sf-detail" style={{ animationDelay: '2.9s' }} />
      {/* launch */}
      <g className="sf-ship">
        <circle cx="66" cy={MID - 56} r="3.6" className="solid" />
      </g>
      {/* scale — the one product becomes many */}
      <g className="sf-scale">
        {[MID - 42, MID - 6, MID + 30].map((y, i) => (
          <g key={i}>
            <path d={`M66,${MID} C82,${MID} 84,${y + 12} 92,${y + 12}`} className="ink faint" />
            <rect x="92" y={y} width="34" height="24" rx="3" className="hi" />
          </g>
        ))}
      </g>
    </g>
  )
}

/* ── 02 · Enterprise Transformation ──────────────────────────────────────
   The outgrown stack migrates block by block into modular services — while the
   line underneath, the business that runs on them, never once stops moving. */
function Transform(): JSX.Element {
  const W = 62
  const H = 24
  const src = [0, 1, 2, 3].map((i) => ({ x: -120, y: MID - 88 + i * 36 }))
  const dst = [
    { x: 12, y: MID - 92 },
    { x: 52, y: MID - 50 },
    { x: 8, y: MID - 8 },
    { x: 48, y: MID + 34 },
  ]
  const flowY = MID + 86
  return (
    <g>
      <rect x="-124" y={MID - 92} width="70" height="148" rx="3" className="ink dash" />
      {src.map((s, i) => (
        <rect key={`s${i}`} x={s.x} y={s.y} width={W} height={H} rx="2" className="ink fill-soft" />
      ))}
      <path d={`M-6,${MID - 104} v190`} className="ink faint" strokeDasharray="2 6" />
      {dst.map((t, i) => (
        <rect
          key={`t${i}`}
          x={t.x}
          y={t.y}
          width={W}
          height={H}
          rx="2"
          className="hi sf-arrived"
          style={{ animationDelay: `${(i * 0.5).toFixed(2)}s` }}
        />
      ))}
      {src.map((s, i) => {
        const t = dst[i]
        const d = `M${s.x},${s.y} C${s.x + 96},${s.y} ${t.x - 82},${t.y} ${t.x},${t.y}`
        return (
          <g
            key={`m${i}`}
            className="sf-cross"
            style={{ offsetPath: `path("${d}")`, animationDelay: `${(i * 0.5).toFixed(2)}s` }}
          >
            <rect x="0" y="0" width={W} height={H} rx="2" className="solid" />
          </g>
        )
      })}
      {/* "without stopping the business that runs on them" — its own clock, never paused */}
      <path d={`M-124,${flowY} h248`} className="ink" />
      {Array.from({ length: 13 }, (_, i) => (
        <path key={`k${i}`} d={`M${-120 + i * 20},${flowY + 5} v5`} className="ink faint" />
      ))}
      <g className="sf-flow">
        <circle cx="0" cy={flowY} r="3.2" className="solid" />
      </g>
    </g>
  )
}

/* ── 03 · Engineering Augmentation ───────────────────────────────────────
   Your team is the outlined mesh; the specialists arriving from outside are the
   solid ones. They take a seat and bond into three existing people each. */
function Augmentation(): JSX.Element {
  const team: [number, number][] = [
    [-92, MID - 46],
    [-30, MID - 74],
    [-104, MID + 30],
    [-40, MID + 58],
    [26, MID + 30],
  ]
  const seats: [number, number][] = [
    [46, MID - 44],
    [76, MID + 10],
  ]
  const arrivals = [
    `M128,${MID - 146} C128,${MID - 100} 62,${MID - 88} 46,${MID - 44}`,
    `M138,${MID + 116} C138,${MID + 74} 94,${MID + 44} 76,${MID + 10}`,
  ]
  const bonds: [number, number][][] = [
    [team[1], team[4], team[0]],
    [team[4], team[3], team[1]],
  ]
  return (
    <g>
      {[
        [0, 1],
        [0, 2],
        [1, 4],
        [2, 3],
        [3, 4],
        [1, 3],
      ].map(([a, b], i) => (
        <path key={`e${i}`} d={`M${team[a][0]},${team[a][1]}L${team[b][0]},${team[b][1]}`} className="ink faint" />
      ))}
      {team.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="4.5" className="ink" fill={BG} />
      ))}
      {seats.map(([x, y], i) => (
        <g key={`s${i}`}>
          <circle
            cx={x}
            cy={y}
            r="8"
            className="ink dash sf-seat"
            style={{ animationDelay: `${(i * 0.4).toFixed(2)}s` }}
          />
          {bonds[i].map((t, j) => (
            <path
              key={j}
              d={`M${x},${y}L${t[0]},${t[1]}`}
              pathLength="1"
              strokeDasharray="1"
              className="hi sf-bond"
              style={{ animationDelay: `${(3.2 + i * 0.5 + j * 0.16).toFixed(2)}s` }}
            />
          ))}
          <g
            className="sf-join"
            style={{ offsetPath: `path("${arrivals[i]}")`, animationDelay: `${(i * 0.4).toFixed(2)}s` }}
          >
            <circle r="5.5" className="solid" />
          </g>
          <circle
            cx={x}
            cy={y}
            r="14"
            className="hi sf-settle"
            style={{ animationDelay: `${(i * 0.4).toFixed(2)}s` }}
          />
        </g>
      ))}
    </g>
  )
}

/* ── 04 · Managed Systems ────────────────────────────────────────────────
   It never resolves — it watches. Uptime bars run steady; one dips, the sweep
   reaches it and catches it, and it is restored. The dashed trend keeps
   climbing: what we built keeps earning its place.

   The sweep crosses in 4s and the anomaly sits at x = -10, dead centre of the
   248-wide baseline, so the sweep is over it at 2s — 25% of the 8s cycle, which
   is exactly when sfCatch fires. */
function Managed(): JSX.Element {
  const base = MID + 54
  const bars = [54, 62, 58, 66, 60, 72, 56, 62, 58, 64, 60, 66]
  return (
    <g>
      <path d={`M-124,${base} h248`} className="ink" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={`t${i}`} d={`M${-110 + i * 20},${base + 5} v5`} className="ink faint" />
      ))}
      {bars.map((v, i) => (
        <path key={`b${i}`} d={`M${-110 + i * 20},${base} v${-v}`} className={i === 5 ? 'hi sf-dip' : 'ink faint'} />
      ))}
      <path d={`M-110,${base - 50} L110,${base - 70}`} className="ink faint" strokeDasharray="3 5" />
      <circle cx="-10" cy={base - 72} r="12" className="hi sf-catch" />
      <g className="sf-sweep">
        <path d={`M0,${base - 96} v112`} className="hi" />
        <circle cx="0" cy={base - 96} r="2.6" className="solid" />
      </g>
      <circle cx="-124" cy={base} r="3.2" className="solid sf-pulse" />
    </g>
  )
}

const ART = [Product, Transform, Augmentation, Managed] as const

/**
 * Pick the gesture that matches the authored solution title, so re-ordering or re-wording in the
 * CMS keeps each lane on the right idea. Order matters: "Engineering Augmentation" must match
 * augmentation before the broader product/engineering test claims it.
 */
export function artIndexFor(title: string | null | undefined, index: number): number {
  const t = (title ?? '').toLowerCase()
  if (/augment|talent|staff|extend|embed/.test(t)) return 2
  if (/managed|maintain|support|monitor|operate|run|sustain/.test(t)) return 3
  if (/transform|legacy|modern|enterprise|migrat|re-?platform/.test(t)) return 1
  if (/product|develop|build|engineer|design/.test(t)) return 0
  return index % ART.length
}

export default function SolutionsFrame({
  focus,
  lanes,
}: {
  /** Index of the lane that should resolve; the rest recede. */
  focus: number
  /** Art index per lane, in card order — see `artIndexFor`. */
  lanes: number[]
}): JSX.Element {
  const wrapRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  // Pointer position is written straight onto the element as CSS variables (and read by the mask
  // spotlight + lume), so moving the cursor never re-renders React.
  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current
    if (!el) return
    const cx = e.clientX
    const cy = e.clientY
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const svg = el.querySelector('svg')
      if (!svg) return
      const m = svg.getScreenCTM()
      if (!m) return
      const p = svg.createSVGPoint()
      p.x = cx
      p.y = cy
      const q = p.matrixTransform(m.inverse())
      el.style.setProperty('--px', `${q.x.toFixed(1)}px`)
      el.style.setProperty('--py', `${q.y.toFixed(1)}px`)
      el.style.setProperty('--on', '1')
      const r = el.getBoundingClientRect()
      el.style.setProperty('--lx', `${(((cx - r.left) / r.width) * 100).toFixed(1)}%`)
      el.style.setProperty('--ly', `${(((cy - r.top) / r.height) * 100).toFixed(1)}%`)
    })
  }, [])

  const onLeave = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.setProperty('--on', '0')
    el.style.setProperty('--px', `${VIEW_W / 2}px`)
    el.style.setProperty('--py', `${MID}px`)
  }, [])

  const n = Math.max(lanes.length, 1)
  const step = VIEW_W / n
  // Lane centres, and the dividers that sit between them.
  const laneX = lanes.map((_, i) => step * (i + 0.5))
  const dividers = Array.from({ length: n - 1 }, (_, i) => step * (i + 1))

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden
      className="sf-frame my-8 aspect-[1200/420] min-h-[168px] lg:my-10"
    >
      <div className="sf-lume" />
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} fill="none" className="sf-svg">
        <defs>
          <radialGradient id="sf-g">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="sf-m" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW_W} height={VIEW_H}>
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#fff" className="sf-base" />
            <circle cx="0" cy="0" r="150" fill="url(#sf-g)" className="sf-spot" />
          </mask>
        </defs>

        <g mask="url(#sf-m)">
          {dividers.map((x) => (
            <path key={x} d={`M${x},58 v304`} className="ink faint" />
          ))}
          {lanes.map((art, i) => {
            const Art = ART[art] ?? ART[0]
            return (
              <g
                key={i}
                transform={`translate(${laneX[i]},0)`}
                className={`sf-lane${focus === i ? ' is-focus' : ''}`}
              >
                <Art />
              </g>
            )
          })}
        </g>
      </svg>

      <div className="sf-marks" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {lanes.map((_, i) => (
          <span key={i} className={`sf-mark${focus === i ? ' is-focus' : ''}`}>
            {String(i + 1).padStart(2, '0')}
          </span>
        ))}
      </div>
    </div>
  )
}
