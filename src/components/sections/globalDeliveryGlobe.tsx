'use client'

import { cn } from '@/utilities/ui'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useRef, useState, type JSX } from 'react'

type Hub = { name: string; location: [number, number]; size?: number }

// Delivery hubs highlighted on the globe. Add rows here (real lat/lng) to light up more locations.
const HUBS: Hub[] = [
  { name: 'Dhaka', location: [23.8103, 90.4125], size: 0.07 },
  { name: 'New York', location: [40.7128, -74.006], size: 0.07 },
]

// The SVG map's palette, normalized to cobe's 0..1 RGB: #757571 land dots, #F4F3EC hub markers.
const BASE_COLOR: [number, number, number] = [0.459, 0.459, 0.443]
const MARKER_COLOR: [number, number, number] = [0.957, 0.953, 0.925]
const GLOW_COLOR: [number, number, number] = [0.13, 0.13, 0.12]

/**
 * WebGL globe (via cobe) replacing the static delivery-network SVG. The globe library is
 * code-split and only fetched once the section scrolls into view. It auto-rotates, zooms in on
 * hover, and can be dragged to spin. Honors prefers-reduced-motion (static, no zoom) and falls
 * back to the original SVG if WebGL/cobe fails to initialize.
 */
export default function GlobalDeliveryGlobe({ className }: { className?: string }): JSX.Element {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  const [inView, setInView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [failed, setFailed] = useState(false)

  // Hover zoom — a spring drives a CSS scale on the canvas wrapper.
  const zoom = useSpring(1, { stiffness: 140, damping: 20, mass: 0.6 })

  // Rotation lives in refs so the render loop always reads the latest without re-creating the globe.
  const phi = useRef(0)
  const dragStart = useRef<number | null>(null) // pointer X at drag start (null = not dragging)
  const dragDelta = useRef(0) // rotation contributed by the active drag
  const autoSpin = useRef(true)

  useEffect(() => {
    autoSpin.current = !reduce
  }, [reduce])

  // Defer loading the WebGL bundle until the section is near the viewport.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Create the globe once in view; clean it up on unmount.
  useEffect(() => {
    if (!inView) return
    const canvas = canvasRef.current
    if (!canvas) return

    let globe: { destroy: () => void } | null = null
    let ro: ResizeObserver | null = null
    let cancelled = false
    let side = 0
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
    const measure = () => {
      side = canvas.offsetWidth
    }

    void (async () => {
      try {
        const createGlobe = (await import('cobe')).default
        if (cancelled) return
        measure()
        globe = createGlobe(canvas, {
          devicePixelRatio: dpr,
          width: side * dpr,
          height: side * dpr,
          phi: 0,
          theta: 0.28,
          dark: 1,
          diffuse: 1.1,
          mapSamples: 16000,
          mapBrightness: 5,
          baseColor: BASE_COLOR,
          markerColor: MARKER_COLOR,
          glowColor: GLOW_COLOR,
          markers: HUBS.map((h) => ({ location: h.location, size: h.size ?? 0.06 })),
          onRender: (state: Record<string, number>) => {
            if (autoSpin.current && dragStart.current === null) phi.current += 0.0035
            state.phi = phi.current + dragDelta.current
            state.width = side * dpr
            state.height = side * dpr
          },
        })
        if (cancelled) {
          globe.destroy()
          return
        }
        requestAnimationFrame(() => {
          if (!cancelled) setMounted(true)
        })
        ro = new ResizeObserver(measure)
        ro.observe(canvas)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()

    return () => {
      cancelled = true
      ro?.disconnect()
      globe?.destroy()
    }
  }, [inView])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (reduce) return
    dragStart.current = e.clientX - dragDelta.current * 100
    canvasRef.current?.setPointerCapture(e.pointerId)
    e.currentTarget.style.cursor = 'grabbing'
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragStart.current === null) return
    dragDelta.current = (e.clientX - dragStart.current) / 100
  }
  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragStart.current === null) return
    dragStart.current = null
    // Fold the drag rotation into the base angle so auto-spin resumes seamlessly.
    phi.current += dragDelta.current
    dragDelta.current = 0
    e.currentTarget.style.cursor = 'grab'
  }

  return (
    <div ref={wrapRef} className={cn('relative mx-auto aspect-square w-full max-w-[600px]', className)}>
      {/* Loading hint: a faint sphere so the space reads as a globe before WebGL paints. */}
      {!mounted && !failed && (
        <div
          aria-hidden
          className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_38%,rgba(117,117,113,0.22),transparent_70%)]"
        />
      )}

      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/globalDelivery.svg" alt="Global delivery network" className="h-full w-full object-contain" />
      ) : (
        <motion.div style={{ scale: zoom }} className="h-full w-full">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Interactive globe highlighting Ternary delivery hubs"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onMouseEnter={() => !reduce && zoom.set(1.15)}
            onMouseLeave={() => zoom.set(1)}
            className="h-full w-full cursor-grab touch-none opacity-0 transition-opacity duration-700 [contain:layout_paint_size]"
            style={{ opacity: mounted ? 1 : undefined }}
          />
        </motion.div>
      )}
    </div>
  )
}
