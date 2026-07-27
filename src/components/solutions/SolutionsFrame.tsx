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

/* ── 01 · a point becomes a product ─────────────────────────────────────── */
function Product(): JSX.Element {
  return (
    <g>
      <circle cx="-110" cy={MID} r="3.2" className="solid sf-seed" />
      <path d={`M-106,${MID} h32`} className="hi sf-reach" pathLength="1" strokeDasharray="1" />
      <rect
        x="-70"
        y={MID - 54}
        width="140"
        height="108"
        rx="4"
        className="hi sf-build"
        pathLength="1"
        strokeDasharray="1"
      />
      <path d={`M-70,${MID - 30} h140`} className="ink sf-detail" style={{ animationDelay: '2.3s' }} />
      <path d={`M-54,${MID + 2} h68`} className="ink faint sf-detail" style={{ animationDelay: '2.6s' }} />
      <path d={`M-54,${MID + 22} h42`} className="ink faint sf-detail" style={{ animationDelay: '2.8s' }} />
      <circle cx="-54" cy={MID - 42} r="2.6" className="solid sf-detail" style={{ animationDelay: '3s' }} />
      <g className="sf-ship">
        <circle cx="70" cy={MID - 54} r="3.6" className="solid" />
      </g>
    </g>
  )
}

/* ── 02 · mass crossing, nothing dropped ────────────────────────────────── */
function Transform(): JSX.Element {
  const SLAB = { w: 60, h: 22 }
  const src = [0, 1, 2, 3].map((i) => ({ x: -114, y: MID - 70 + i * 34 }))
  const dst = [
    { x: 16, y: MID - 78 },
    { x: 66, y: MID - 36 },
    { x: 12, y: MID + 6 },
    { x: 62, y: MID + 46 },
  ]
  return (
    <g>
      <rect x="-118" y={MID - 76} width="68" height="140" rx="3" className="ink dash" />
      {src.map((s, i) => (
        <rect key={`s${i}`} x={s.x} y={s.y} width={SLAB.w} height={SLAB.h} rx="2" className="ink fill-soft" />
      ))}
      <path d={`M0,${MID - 118} v236`} className="ink faint" strokeDasharray="2 6" />
      {dst.map((t, i) => (
        <rect
          key={`t${i}`}
          x={t.x}
          y={t.y}
          width={SLAB.w}
          height={SLAB.h}
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
            <rect x="0" y="0" width={SLAB.w} height={SLAB.h} rx="2" className="solid" />
          </g>
        )
      })}
    </g>
  )
}

/* ── 03 · the team, plus one ────────────────────────────────────────────── */
function Augmentation(): JSX.Element {
  const team: [number, number][] = [
    [-96, MID - 52],
    [-24, MID - 80],
    [-108, MID + 28],
    [-36, MID + 60],
    [34, MID + 36],
  ]
  const seat: [number, number] = [48, MID - 36]
  const bonds = [team[1], team[4], team[0], team[3]]
  const arrival = `M132,${MID - 152} C132,${MID - 100} ${seat[0] + 30},${MID - 86} ${seat[0]},${seat[1]}`
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
        <circle key={`n${i}`} cx={x} cy={y} r="4.5" className="ink" />
      ))}
      <circle cx={seat[0]} cy={seat[1]} r="8" className="ink dash sf-seat" />
      {bonds.map(([x, y], i) => (
        <path
          key={`b${i}`}
          d={`M${seat[0]},${seat[1]}L${x},${y}`}
          pathLength="1"
          strokeDasharray="1"
          className="hi sf-bond"
          style={{ animationDelay: `${(3.1 + i * 0.16).toFixed(2)}s` }}
        />
      ))}
      <g className="sf-join" style={{ offsetPath: `path("${arrival}")` }}>
        <circle r="5.5" className="solid" />
      </g>
      <circle cx={seat[0]} cy={seat[1]} r="14" className="hi sf-settle" />
    </g>
  )
}

/* ── 04 · it never resolves. It watches. ──────────────────────────────────
   The sweep crosses in 4s; the anomaly sits at x = 8, which is 53.2% of the way across the
   baseline. So the catch fires at 76.6% of the 8s cycle — the second pass. The first pass misses
   it, which is the point. */
function Managed(): JSX.Element {
  return (
    <g>
      <path d={`M-124,${MID} h248`} className="ink" />
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={`M${-120 + i * 20},${MID + 6} v6`} className="ink faint" />
      ))}
      <g className="sf-spike">
        <path d={`M-10,${MID} L8,${MID - 52} L26,${MID}`} className="hi" />
      </g>
      <circle cx="8" cy={MID - 52} r="12" className="hi sf-catch" />
      <g className="sf-sweep">
        <path d={`M0,${MID - 84} v168`} className="hi" />
        <circle cx="0" cy={MID - 84} r="2.6" className="solid" />
      </g>
      <circle cx="-124" cy={MID} r="3.2" className="solid sf-pulse" />
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
