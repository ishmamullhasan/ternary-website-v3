'use client'

import { useEffect, useRef } from 'react'

/**
 * The signature scale panel graphic — a crisp isometric line figure over a dim, slowly drifting
 * gradient bed. Ported faithfully from the scales-iso preview's two inline canvas systems and
 * re-skinned to the real token system: every hairline and every gradient blob is cream
 * (rgb 244 243 236) — the preview's warm grounds and its purple/blue/teal blobs are gone. There is
 * no amber and no colour outside the cream/near-black range the site already ships.
 *
 * Three figures carry the three scales:
 *   fan   — fast rippling planes (velocity, 01)
 *   cubes — a phased isometric cluster (structure, 02)
 *   stack — settling secured layers with a seal (mission, 03)
 *
 * Reduced motion is honoured like the other hub canvases (HeroNodeField): under the OS
 * `prefers-reduced-motion` query or the in-app A11yFab toggle (`html[data-a11y-motion='reduce']`)
 * each canvas paints a single still frame and never animates.
 */

type Fig = 'fan' | 'cubes' | 'stack'
type Pt = [number, number]

const CREAM = '244,243,236'

// Per-scale gradient bed: same cadence as the preview, blobs recoloured to a single cream hue at a
// low alpha so `lighter` compositing reads as a soft luminous bed rather than a bright wash.
const GRAD: Record<number, { n: number; spd: number; r: number; a: number }> = {
  1: { n: 5, spd: 1.1, r: 0.6, a: 0.11 },
  2: { n: 4, spd: 0.7, r: 0.66, a: 0.1 },
  3: { n: 4, spd: 0.46, r: 0.72, a: 0.09 },
}

export default function ScaleFigure({ scale, fig }: { scale: 1 | 2 | 3; fig: Fig }) {
  const gradRef = useRef<HTMLCanvasElement | null>(null)
  const isoRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const reduce =
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.a11yMotion === 'reduce'

    const cleanups: Array<() => void> = []

    /* ── isometric line figure ─────────────────────────────────────────────────────────────── */
    const isoCv = isoRef.current
    const isoCtx = isoCv?.getContext('2d') ?? null
    if (isoCv && isoCtx) {
      const cv = isoCv
      const ctx = isoCtx
      const COS = 0.8660254
      const SIN = 0.5
      const L = (a: number) => `rgba(${CREAM},${a})`
      const FILL = `rgba(${CREAM},0.018)`
      let W = 0
      let H = 0
      let vis = true
      let raf = 0

      const size = () => {
        const r = cv.getBoundingClientRect()
        W = Math.max(1, r.width)
        H = Math.max(1, r.height)
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        cv.width = Math.round(W * dpr)
        cv.height = Math.round(H * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      const pt = (x: number, y: number, z: number, cx: number, cy: number, sc: number): Pt => [
        cx + (x - z) * COS * sc,
        cy + ((x + z) * SIN - y) * sc,
      ]
      const poly = (P: Pt[], a: number, fill: string | null) => {
        ctx.beginPath()
        ctx.moveTo(P[0][0], P[0][1])
        for (let k = 1; k < P.length; k++) ctx.lineTo(P[k][0], P[k][1])
        ctx.closePath()
        if (fill) {
          ctx.fillStyle = fill
          ctx.fill()
        }
        ctx.strokeStyle = L(a)
        ctx.stroke()
      }
      const seg = (a: Pt, b: Pt, al: number) => {
        ctx.strokeStyle = L(al)
        ctx.beginPath()
        ctx.moveTo(a[0], a[1])
        ctx.lineTo(b[0], b[1])
        ctx.stroke()
      }

      const drawFan = (cx: number, cy: number, sc: number, T: number) => {
        const N = 9
        const w = 2.5
        const x0 = -1.25
        const dz = 0.4
        for (let i = 0; i < N; i++) {
          const z = (i - (N - 1) / 2) * dz
          const rise = 0.45 + 1.7 * (i / (N - 1))
          const h = rise + 0.42 * Math.sin(T * 2.2 - i * 0.5)
          const A = pt(x0, 0, z, cx, cy, sc)
          const B = pt(x0 + w, 0, z, cx, cy, sc)
          const C = pt(x0 + w, h, z, cx, cy, sc)
          const D = pt(x0, h, z, cx, cy, sc)
          poly([A, B, C, D], 0.2 + 0.5 * (i / (N - 1)), FILL)
        }
      }
      const drawCube = (
        gx: number,
        gz: number,
        c: number,
        ly: number,
        cx: number,
        cy: number,
        sc: number,
        a: number,
      ) => {
        const V = (X: number, Y: number, Z: number) => pt(X, Y, Z, cx, cy, sc)
        const b1 = V(gx + c, ly, gz)
        const b2 = V(gx + c, ly, gz + c)
        const b3 = V(gx, ly, gz + c)
        const t0 = V(gx, ly + c, gz)
        const t1 = V(gx + c, ly + c, gz)
        const t2 = V(gx + c, ly + c, gz + c)
        const t3 = V(gx, ly + c, gz + c)
        poly([t0, t1, t2, t3], a, FILL) // top
        poly([b1, t1, t2, b2], a * 0.9, FILL) // right
        poly([b3, t3, t2, b2], a * 0.78, FILL) // left
        const k1 = V(gx + 0.14, ly + c, gz + 0.14)
        const k2 = V(gx + 0.38, ly + c, gz + 0.14)
        const k3 = V(gx + 0.38, ly + c, gz + 0.38)
        const k4 = V(gx + 0.14, ly + c, gz + 0.38)
        poly([k1, k2, k3, k4], a * 0.9, null) // top chip
      }
      const drawCubes = (cx: number, cy: number, sc: number, T: number) => {
        const cu: number[][] = [
          [0, 0, 1.05, 0.0],
          [-1.2, 0.5, 0.92, 0.9],
          [1.15, 0.35, 0.92, 1.8],
          [0.02, 1.32, 0.86, 2.6],
        ]
        cu.sort((p, q) => p[0] + p[1] - (q[0] + q[1]))
        for (const c of cu) {
          const ly = 0.13 * Math.sin(T * 1.25 - c[3]) + 0.13
          drawCube(c[0], c[1], c[2], ly, cx, cy, sc, 0.5)
        }
      }
      const drawStack = (cx: number, cy: number, sc: number, T: number) => {
        const N = 5
        const S = 2.2
        const gap = 0.5 + 0.05 * Math.sin(T * 0.6)
        const th = 0.09
        const V = (X: number, Y: number, Z: number) => pt(X, Y, Z, cx, cy, sc)
        for (let i = 0; i < N; i++) {
          const y = i * gap
          const a = 0.22 + 0.5 * (i / (N - 1))
          const A = V(0, y, 0)
          const B = V(S, y, 0)
          const C = V(S, y, S)
          const D = V(0, y, S)
          poly([A, B, C, D], a, FILL)
          const Bb = V(S, y - th, 0)
          const Cb = V(S, y - th, S)
          const Db = V(0, y - th, S)
          seg(B, Bb, a * 0.8)
          seg(Bb, Cb, a * 0.8)
          seg(Cb, C, a * 0.8)
          seg(Cb, Db, a * 0.8)
          seg(Db, D, a * 0.8)
        }
        const ctr = V(S / 2, (N - 1) * gap, S / 2)
        const rr = sc * 0.44
        ctx.strokeStyle = L(0.72)
        ctx.beginPath()
        ctx.ellipse(ctr[0], ctr[1] - rr * 0.12, rr, rr * 0.5, 0, 0, 6.2832)
        ctx.stroke()
        seg([ctr[0] - rr, ctr[1] - rr * 0.12], [ctr[0] + rr, ctr[1] - rr * 0.12], 0.72)
        seg([ctr[0] - rr * 0.72, ctr[1] + rr * 0.04], [ctr[0] + rr * 0.72, ctr[1] + rr * 0.04], 0.5)
        seg([ctr[0] - rr * 0.4, ctr[1] + rr * 0.16], [ctr[0] + rr * 0.4, ctr[1] + rr * 0.16], 0.34)
      }

      const frame = (t: number) => {
        ctx.clearRect(0, 0, W, H)
        ctx.lineWidth = 1.1
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        const sc = Math.min(W, H) / 6.4
        const cx = W / 2
        const cy = H * 0.56
        const T = t * 0.001
        if (fig === 'fan') drawFan(cx, cy, sc, T)
        else if (fig === 'cubes') drawCubes(cx, cy, sc, T)
        else drawStack(cx, cy, sc, T)
      }

      size()
      const loop = (ts: number) => {
        if (vis) frame(ts)
        raf = requestAnimationFrame(loop)
      }
      if (reduce) frame(2600)
      else raf = requestAnimationFrame(loop)

      let io: IntersectionObserver | null = null
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(
          (es) => es.forEach((e) => (vis = e.isIntersecting)),
          { threshold: 0.01 },
        )
        io.observe(cv)
      }
      let rt: ReturnType<typeof setTimeout>
      const onResize = () => {
        clearTimeout(rt)
        rt = setTimeout(() => {
          size()
          if (reduce) frame(2600)
        }, 180)
      }
      window.addEventListener('resize', onResize)
      cleanups.push(() => {
        cancelAnimationFrame(raf)
        clearTimeout(rt)
        io?.disconnect()
        window.removeEventListener('resize', onResize)
      })
    }

    /* ── gradient bed (dimmed behind the figure) ───────────────────────────────────────────── */
    const gradCv = gradRef.current
    const gradCtx = gradCv?.getContext('2d') ?? null
    if (gradCv && gradCtx) {
      const cv = gradCv
      const ctx = gradCtx
      const cfg = GRAD[scale] ?? GRAD[1]
      let W = 0
      let H = 0
      let vis = true
      let raf = 0
      type Blob = {
        ox: number
        oy: number
        ax: number
        ay: number
        fx: number
        fy: number
        ph: number
        r: number
      }
      let blobs: Blob[] = []

      const size = () => {
        const r = cv.getBoundingClientRect()
        W = Math.max(1, r.width)
        H = Math.max(1, r.height)
        const q = Math.min(1, 520 / W) * Math.min(window.devicePixelRatio || 1, 1.5)
        cv.width = Math.max(1, Math.round(W * q))
        cv.height = Math.max(1, Math.round(H * q))
        ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0)
      }
      const initBlobs = () => {
        const b: Blob[] = []
        for (let i = 0; i < cfg.n; i++) {
          b.push({
            ox: 0.15 + Math.random() * 0.7,
            oy: 0.15 + Math.random() * 0.7,
            ax: 0.08 + Math.random() * 0.12,
            ay: 0.08 + Math.random() * 0.12,
            fx: 0.15 + Math.random() * 0.3,
            fy: 0.15 + Math.random() * 0.3,
            ph: Math.random() * 6.28,
            r: cfg.r * (0.65 + Math.random() * 0.6),
          })
        }
        blobs = b
      }
      const render = (t: number) => {
        const T = t * 0.001 * cfg.spd
        const R = Math.hypot(W, H)
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = 'rgb(8,8,8)' // cold near-black bed (page is #050505); no warm ground
        ctx.fillRect(0, 0, W, H)
        ctx.globalCompositeOperation = 'lighter'
        for (const bl of blobs) {
          const x = (bl.ox + bl.ax * Math.sin(T * bl.fx + bl.ph)) * W
          const y = (bl.oy + bl.ay * Math.cos(T * bl.fy + bl.ph * 1.3)) * H
          const rad = bl.r * R * 0.5
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
          g.addColorStop(0, `rgba(${CREAM},${cfg.a})`)
          g.addColorStop(0.5, `rgba(${CREAM},${cfg.a * 0.3})`)
          g.addColorStop(1, `rgba(${CREAM},0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(x, y, rad, 0, 6.283)
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      size()
      initBlobs()
      const loop = (ts: number) => {
        if (vis) render(ts)
        raf = requestAnimationFrame(loop)
      }
      if (reduce) render(4000)
      else raf = requestAnimationFrame(loop)

      let io: IntersectionObserver | null = null
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(
          (es) => es.forEach((e) => (vis = e.isIntersecting)),
          { threshold: 0.01 },
        )
        io.observe(cv)
      }
      let rt: ReturnType<typeof setTimeout>
      const onResize = () => {
        clearTimeout(rt)
        rt = setTimeout(() => {
          size()
          initBlobs()
          if (reduce) render(4000)
        }, 180)
      }
      window.addEventListener('resize', onResize)
      cleanups.push(() => {
        cancelAnimationFrame(raf)
        clearTimeout(rt)
        io?.disconnect()
        window.removeEventListener('resize', onResize)
      })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [fig, scale])

  return (
    <>
      <canvas ref={gradRef} className="grad" aria-hidden="true" />
      <canvas ref={isoRef} className="iso" aria-hidden="true" />
    </>
  )
}
