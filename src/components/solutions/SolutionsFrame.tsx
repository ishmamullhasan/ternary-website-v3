'use client'

import { iso, MID, type P3 } from '@/components/iso/iso'
import { useCallback, useRef, type JSX } from 'react'
import './solutionsFrame.css'

/**
 * SolutionsFrame — one wide field, four movements.
 *
 * Replaces the gradient hero above the solution cards. Each lane is an isometric
 * scene that answers its solution: a product built layer by layer; an outgrown
 * estate consolidated into one assembly; specialists converging on a team; and a
 * system kept in orbit — the only lane whose gesture never resolves, because
 * Managed Systems is the only engagement that doesn't finish.
 *
 * Drawn on a 2:1 dimetric projector (the same construction system as the industry
 * blueprints): forms are described in world coordinates (x right, y depth, z up)
 * and projected, so the geometry is true rather than faked with skews. Markup is
 * built as a plain string per lane — no DOM APIs — and every edge stays a real
 * <path>, so the whole set is vector at any size.
 *
 * Lanes are bound to the cards below: hover or focus a card and its lane resolves
 * while the others recede (`focus`, owned by the parent so the cards stay the
 * single source of truth). Purely decorative — the cards carry every word — so
 * the whole frame is aria-hidden.
 */

const VIEW_W = 1200
const VIEW_H = 420

/* ── 01 · Product Development ────────────────────────────────────────────
   "conception to scale": a spark on the build plate, and the product assembles
   above it layer by layer until the surface itself exists. */
function product(): string {
  // OY 48 puts the settled stack's optical centre on ~205, the same line the
  // other three lanes sit on — measured, not eyeballed.
  const g = iso(1.4, 48)
  const X = 46
  g.open('grid')
  for (let i = -X; i <= X; i += 11.5) {
    g.raw(`<path d="M${g.S(g.pr([i, -X, 0]))} L${g.S(g.pr([i, X, 0]))}"/>`)
    g.raw(`<path d="M${g.S(g.pr([-X, i, 0]))} L${g.S(g.pr([X, i, 0]))}"/>`)
  }
  g.close()
  g.box(0, 0, 0, 38, 38, 9, 7)
  g.open('sf-glow')
  g.face(0, 0, 9, 7, 7, 3, 'solid')
  g.close()

  const layers: [number, number][] = [
    [30, 32],
    [46, 32],
    [62, 32],
    [82, 38],
  ]
  layers.forEach(([z, hx], i) => {
    g.open('sf-lift', `animation-delay:${(i * 0.28).toFixed(2)}s`)
    const below = i === 0 ? 9 : layers[i - 1][0] + 2.5
    for (const [x, y] of [
      [-hx, -hx],
      [hx, -hx],
      [hx, hx],
      [-hx, hx],
    ]) {
      g.line([x, y, below], [x, y, z], 'ink faint dash')
    }
    g.box(0, 0, z, hx, hx, 2.5, 6)
    if (i === layers.length - 1) {
      g.face(-6, -6, z + 2.5, 20, 13, 3, 'hi')
      g.face(16, 14, z + 2.5, 11, 11, 3, 'ink faint')
      for (const k of [0, 1]) g.line([-20, 16 + k * 8, z + 2.5], [2, 16 + k * 8, z + 2.5], 'ink faint')
    }
    g.close()
  })
  return g.done()
}

/* ── 02 · Enterprise Transformation ──────────────────────────────────────
   Rebuilt for what comes next: the four parts land, one after another, onto one
   shared platform — the outgrown estate consolidated into a single system.
   Centred and scaled so its 122 half-width sits between 01's grid (129) and 04's
   orbit (112), and OY lifts it onto the same optical centre (~205) as the rest.
   No ghost footprints here: they would sit directly under the pods and read as
   stray dashes, and the reference's assembled block has none either. */
function transform(): string {
  const g = iso(1.9, 8)
  g.box(0, 0, 0, 32, 32, 6, 4)
  ;[
    [-15, -15],
    [15, -15],
    [-15, 15],
    [15, 15],
  ].forEach(([x, y], i) => {
    g.open('sf-assemble', `animation-delay:${(i * 0.16).toFixed(2)}s`)
    g.box(x, y, 6, 14, 14, 11, 4, 'hi')
    g.close()
  })
  return g.done()
}

/* ── 03 · Engineering Augmentation ───────────────────────────────────────
   Your team is the assembly at the centre; the specialists stand on their own
   footprints and are drawn inward until they are part of it. */
function augmentation(): string {
  const g = iso(1.2, 0)
  g.box(0, 0, 0, 34, 34, 6, 5)
  for (const [x, y] of [
    [-16, -16],
    [16, -16],
    [-16, 16],
    [16, 16],
  ]) {
    g.box(x, y, 6, 15, 15, 10, 5)
  }
  const out: [number, number][] = [
    [0, -72],
    [-72, 0],
    [72, 0],
    [0, 72],
    [-58, -58],
    [58, 58],
  ]
  out.forEach(([x, y], i) => {
    const delay = `animation-delay:${(i * 0.18).toFixed(2)}s`
    g.face(x, y, 0, 15, 15, 4, 'ink faint dash')
    g.box(x, y, 0, 12, 12, 9, 4)
    const from: P3 = [x * 0.62, y * 0.62, 5]
    const to: P3 = [x * 0.34, y * 0.34, 5]
    const p = g.pr(from)
    const q = g.pr(to)
    g.raw(`<path d="M${g.S(p)} L${g.S(q)}" class="hi sf-draw" pathLength="1" stroke-dasharray="1" style="${delay}"/>`)
    g.arrow(from, to, 'hi sf-draw')
    const trail = `M${g.S(g.pr([x, y, 9]))} L${g.S(g.pr([x * 0.3, y * 0.3, 9]))}`
    g.open('sf-inbound', `offset-path:path('${trail}');${delay}`)
    g.raw('<circle r="2.6" class="solid"/>')
    g.close()
  })
  return g.done()
}

/* ── 04 · Managed Systems ────────────────────────────────────────────────
   It never resolves — it orbits. Probes at the cardinals report back, and three
   lights keep going round on their own clock, long after everything else has
   settled. */
function managed(): string {
  const g = iso(1.2, 0)
  const R = 66
  const c = g.pr([0, 0, 4])
  const ex = R * 1.2 * Math.SQRT2
  const ey = ex / 2
  const ring =
    `M${g.n(c[0] - ex)},${g.n(c[1])} A${g.n(ex)},${g.n(ey)} 0 1 0 ${g.n(c[0] + ex)},${g.n(c[1])}` +
    ` A${g.n(ex)},${g.n(ey)} 0 1 0 ${g.n(c[0] - ex)},${g.n(c[1])}`
  g.raw(`<path d="${ring}" class="ink faint"/>`)

  g.box(0, 0, 0, 34, 34, 6, 5)
  for (const [x, y] of [
    [-16, -16],
    [16, -16],
    [-16, 16],
    [16, 16],
  ]) {
    g.box(x, y, 6, 15, 15, 10, 5)
  }
  for (const [x, y] of [
    [0, -R],
    [-R, 0],
    [R, 0],
    [0, R],
  ]) {
    g.box(x, y, 0, 8, 8, 6, 3)
    const from: P3 = [x * 0.82, y * 0.82, 4]
    const to: P3 = [x * 0.42, y * 0.42, 4]
    g.line(from, to, 'ink faint')
    g.arrow(from, to, 'ink faint')
  }
  for (const i of [0, 1, 2]) {
    g.open('sf-orbit', `offset-path:path('${ring}');animation-delay:${(-i * 3).toFixed(2)}s`)
    g.raw('<circle r="2.8" class="solid"/>')
    g.close()
  }
  return g.done()
}

/* ── Hero · one standard behind all of them ──────────────────────────────
   The hero's right half was empty. This fills it with the sentence next to it
   rather than an ornament: four plates at four heights — the four ways in, each
   a different shape — over the single ruled ground they all rest on.

   Deliberately unlike the four scene marks it sits above. Those are objects,
   read at object scale; this is a field — wider, flatter, quieter, and set at
   roughly half their contrast — so it registers as the backdrop to the copy and
   never competes with the headline for first read. */
function standard(): string {
  const g = iso(3.1, 22)
  const R = 3
  const SPAN = 30

  // The shared ground. Ruled rather than solid: a plane you can see through is
  // quieter than a filled one, and the rules read as measurement, not as border.
  for (let i = -SPAN; i <= SPAN; i += 10) {
    g.line([i, -SPAN, 0], [i, SPAN, 0], 'ink faint')
    g.line([-SPAN, i, 0], [SPAN, i, 0], 'ink faint')
  }
  g.face(0, 0, 0, SPAN, SPAN, R, 'ink')

  // Four plates, one per solution, at four heights. Painted far to near so each
  // box's occluder hides what sits behind it.
  const plates: [number, number, number][] = [
    [-13, -13, 30],
    [13, -13, 21],
    [-13, 13, 16],
    [13, 13, 25],
  ]
  // Painted far to near, so each box's occluder hides what sits behind it. No footprint
  // outlines: four more rounded rectangles down among the plates read as clutter, not as
  // structure — the plates already sit visibly over the ground.
  plates.forEach(([x, y, z], i) => {
    g.open('sf-drift', `animation-delay:${(-i * 2.2).toFixed(1)}s`)
    g.box(x, y, z, 8.5, 8.5, 1.8, R, 'ink')
    g.close()
  })

  return g.done()
}

const ART = [product, transform, augmentation, managed] as const

/**
 * Pick the scene that matches the authored solution title, so re-ordering or
 * re-wording in the CMS keeps each lane on the right idea. Order matters:
 * "Engineering Augmentation" must match augmentation before the broader
 * product/engineering test claims it.
 */
export function artIndexFor(title: string | null | undefined, index: number): number {
  const t = (title ?? '').toLowerCase()
  if (/augment|talent|staff|extend|embed/.test(t)) return 2
  if (/managed|maintain|support|monitor|operate|run|sustain/.test(t)) return 3
  if (/transform|legacy|modern|enterprise|migrat|re-?platform/.test(t)) return 1
  if (/product|develop|build|engineer|design/.test(t)) return 0
  return index % ART.length
}

/* Measured bounding boxes of the four scenes, in the frame's own coordinate space
   (`getBBox()` on each rendered lane). Hardcoded because the art is built as a
   string, so there is no layout pass on the server to measure it against. If a
   scene's paths change, re-measure — nothing here will notice on its own. */
const ART_BOX = [
  { y: 87.8, h: 234.6 }, // product      — the exploded stack; twice the height of the others
  { y: 131.5, h: 147.3 }, // transform
  { y: 116.1, h: 180.6 }, // augmentation
  { y: 148.5, h: 112.7 }, // managed
] as const

/* Target painted height, and the centre every scene is squashed toward, so the four
   marks read as one set instead of the 113–235px spread they were drawn at. */
const MARK_H = 150
const MARK_CY = 205

/**
 * A single lane, lifted out of the frame — the solutions hub renders the scene
 * that belongs to each solution beside its heading, so the hub and the home
 * page section speak the same visual language.
 *
 * Each lane's art is authored around a local x of 0 (the frame translates it
 * into place afterwards), so a viewBox centred on 0 needs no path changes. No
 * mask, no pointer field, no `is-focus` state — there is only one lane, so
 * nothing needs to recede.
 *
 * SIZING. The scenes were authored to sit side by side in one wide frame, where
 * differing heights read as variety. Stacked one per solution down a page they
 * just read as inconsistent, so each is scaled to a common painted height —
 * and the transform is deliberately constrained two ways:
 *
 *   • Vertical only. These are isometric figures; scaling x as well would narrow
 *     them into a different projection, and the set would stop matching the home
 *     page frame they came from.
 *   • Never above 1. The two short scenes are left short rather than stretched —
 *     pulling `managed` up to 150 would mean 1.33x, which turns its orbit ring
 *     into an obvious ellipse. Squashing the tall one is nearly invisible;
 *     stretching a short one is not.
 *
 * `translate(CY) scale(sy) translate(-cy)` maps each figure's own centre onto a
 * shared one, so they are aligned as well as matched — squashing in place would
 * leave `product` sitting 30px higher than the rest.
 *
 * The viewBox is then the common box those transforms produce, plus ~10px: NOT
 * the frame's 1200×420, which gave every mark ~100px of blank space above and
 * below, and not each scene's own extents, which would render the smallest
 * scene largest.
 */
/**
 * The hero figure. Its viewBox is set from the measured extents of `standard()`
 * — see SolutionMark for why these are hardcoded rather than computed.
 */
export function SolutionsHeroMark(): JSX.Element {
  return (
    <svg viewBox="-194 59 388 274" fill="none" aria-hidden className="sf-svg sf-solo sf-hero">
      <g dangerouslySetInnerHTML={{ __html: standard() }} />
    </svg>
  )
}

/**
 * Prepare an art string to be drawn stroke by stroke.
 *
 * Two additions per strokeable element:
 *   • `pathLength="1"` — normalises every path to a length of 1 so one
 *     `stroke-dasharray: 1` draws them all at the same rate. Without it a long
 *     edge and a short tick take wildly different times to appear.
 *   • `style="--i:N"` — its index, which the CSS turns into a stagger delay, so
 *     the figure builds up rather than materialising at once.
 *
 * Occluders are skipped deliberately: they are fills, not strokes, so a dash
 * offset does nothing to them — and they must keep hiding what is behind them
 * from the very first frame, or the drawing shows through its own boxes.
 */
function drawable(svg: string): string {
  let i = 0
  return svg.replace(/<(path|line)\s+([^>]*?)class="((?:ink|hi|solid)[^"]*)"/g, (m, tag, attrs, cls) =>
    cls.includes('occ') ? m : `<${tag} ${attrs}class="${cls}" pathLength="1" style="--i:${i++}"`,
  )
}

export function SolutionMark({ art }: { art: number }): JSX.Element {
  const box = ART_BOX[art] ?? ART_BOX[0]
  const sy = Math.min(1, MARK_H / box.h)
  const cy = box.y + box.h / 2

  return (
    <svg viewBox="-136 120 272 170" fill="none" aria-hidden className="sf-svg sf-solo">
      <g
        transform={`translate(0 ${MARK_CY}) scale(1 ${sy.toFixed(4)}) translate(0 ${-cy})`}
        dangerouslySetInnerHTML={{ __html: drawable((ART[art] ?? ART[0])()) }}
      />
    </svg>
  )
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
          {lanes.map((art, i) => (
            <g
              key={i}
              transform={`translate(${laneX[i]},0)`}
              className={`sf-lane${focus === i ? ' is-focus' : ''}`}
              dangerouslySetInnerHTML={{ __html: (ART[art] ?? ART[0])() }}
            />
          ))}
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
