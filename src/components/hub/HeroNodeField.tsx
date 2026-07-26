'use client'

import { useEffect, useRef } from 'react'

/**
 * Ambient node-field for hub heroes — a slow constellation of drifting points with one softly
 * pulsing "active" node, drawn on a masked canvas behind the headline. Ported from the preview's
 * inline script, re-coloured to the real tokens: the active node is cream, the rest are the neutral
 * body grey. No amber. Present but never competing.
 *
 * Respects reduced motion: under the OS `prefers-reduced-motion` query or the in-app A11yFab toggle
 * (`html[data-a11y-motion='reduce']`) it paints a single static frame and never animates.
 */
export default function HeroNodeField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const reduce =
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.a11yMotion === 'reduce'

    let W = 0
    let H = 0
    let DPR = 1
    let nodes: { x: number; y: number; vx: number; vy: number }[] = []
    let activeIndex = 0
    let raf = 0
    let t = 0

    const size = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2)
      const r = cv.getBoundingClientRect()
      W = r.width
      H = r.height
      cv.width = Math.max(1, W * DPR)
      cv.height = Math.max(1, H * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    const init = () => {
      size()
      const N = W < 720 ? 14 : 26
      nodes = []
      for (let i = 0; i < N; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
        })
      }
      activeIndex = Math.floor(N * 0.5)
    }
    const maxDist = () => (W < 720 ? 150 : 210)
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const m = maxDist()
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < m) {
            ctx.strokeStyle = `rgba(170,170,170,${(1 - d / m) * 0.16})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        if (i === activeIndex) {
          const p = 0.5 + 0.5 * Math.sin(t * 0.0015)
          ctx.fillStyle = `rgba(244,243,236,${0.09 + 0.1 * p})`
          ctx.beginPath()
          ctx.arc(n.x, n.y, 15, 0, 7)
          ctx.fill()
          ctx.fillStyle = `rgba(244,243,236,${0.55 + 0.35 * p})`
          ctx.beginPath()
          ctx.arc(n.x, n.y, 2.8, 0, 7)
          ctx.fill()
        } else {
          ctx.fillStyle = 'rgba(170,170,170,.45)'
          ctx.beginPath()
          ctx.arc(n.x, n.y, 1.7, 0, 7)
          ctx.fill()
        }
      }
    }
    const step = (ts: number) => {
      t = ts
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      }
      draw()
      raf = requestAnimationFrame(step)
    }
    const start = () => {
      cancelAnimationFrame(raf)
      init()
      if (reduce) draw()
      else raf = requestAnimationFrame(step)
    }

    start()
    let rt: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(rt)
      rt = setTimeout(start, 180)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(rt)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
