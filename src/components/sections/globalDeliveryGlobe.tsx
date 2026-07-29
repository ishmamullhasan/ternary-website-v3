'use client'

import { laneColor } from '@/components/sections/laneColors'
import { cn } from '@/utilities/ui'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type JSX } from 'react'

/** One end of a lane, as authored in the CMS (Global Delivery block → Shipping Lanes). */
export type LanePoint = { label?: string | null; lat?: number | null; lng?: number | null }
export type GlobeLane = {
  from?: LanePoint | null
  to?: LanePoint | null
  color?: string | null
}

// Fallback routes, used when the block carries no lanes: everything ships out of Dhaka, to one US
// hub per coast plus the interior, so three lanes read as national coverage without crowding the
// sphere. These are what the globe drew before the lanes became CMS-authored.
const DEFAULT_LANES: GlobeLane[] = [
  {
    from: { label: 'Dhaka', lat: 23.8103, lng: 90.4125 },
    to: { label: 'New York', lat: 40.7128, lng: -74.006 },
    color: 'cream',
  },
  {
    from: { label: 'Dhaka', lat: 23.8103, lng: 90.4125 },
    to: { label: 'Austin', lat: 30.2672, lng: -97.7431 },
    color: 'amber',
  },
  {
    from: { label: 'Dhaka', lat: 23.8103, lng: 90.4125 },
    to: { label: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    color: 'azure',
  },
]

// The SVG map's palette, normalized to cobe's 0..1 RGB: #757571 land dots, #F4F3EC hub markers.
const BASE_COLOR: [number, number, number] = [0.459, 0.459, 0.443]
const MARKER_COLOR: [number, number, number] = [0.957, 0.953, 0.925]
const GLOW_COLOR: [number, number, number] = [0.13, 0.13, 0.12]

// Marker sizes. An origin is a place work ships *from* and usually anchors several lanes, so it
// gets the larger dot.
const ORIGIN_SIZE = 0.08
const DESTINATION_SIZE = 0.05

// Globe tilt. Shared by cobe (the `theta` option) and the overlay's projection — they must agree
// or the arcs will drift off the sphere.
const THETA = 0.12

// Sphere radius in cobe's clip space: its fragment shader tests `dot(a, a) <= 0.64`.
const SPHERE_R = 0.8

// The lanes arch well past the sphere — a near-antipodal hop peaks around 1.5× the globe radius,
// which lands outside the globe canvas. The overlay is grown by this fraction of the globe's side
// on every edge so the flares have somewhere to go. Keep in sync with the overlay canvas's
// `-inset-[10%] h-[120%] w-[120%]` and the wrapper's `py-[10%]`, which reserves the room in layout.
const ARC_PAD = 0.1

const ARC_SEGMENTS = 96
const PULSE_MS = 2800 // one shipment's travel time, origin → destination
const PULSE_TAIL = 0.14 // comet trail length, as a fraction of the arc

type Vec3 = [number, number, number]

const DEG = Math.PI / 180

/**
 * Lat/lng → cobe's marker basis: +y is the north pole, and longitude is measured from the
 * antimeridian (this mirrors the `location` → vec3 conversion inside cobe, so overlay arcs land
 * exactly on the WebGL markers).
 */
function toVec3([lat, lng]: [number, number]): Vec3 {
  const p = lat * DEG
  const l = lng * DEG - Math.PI
  const cp = Math.cos(p)
  return [-cp * Math.cos(l), Math.sin(p), cp * Math.sin(l)]
}

/**
 * Great-circle arc from `a` to `b`, lifted off the surface so it reads as a flight path rather
 * than a line drawn on the sphere. Longer hops arch higher. Returns points with the lift already
 * baked into their length — the projection is orthographic, so scaling the vector is all it takes.
 */
function greatCircleArc(a: Vec3, b: Vec3): Vec3[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  const sinOmega = Math.sin(omega)
  const lift = 0.16 + 0.34 * (omega / Math.PI)

  const points: Vec3[] = []
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS
    let v: Vec3
    if (sinOmega < 1e-6) {
      v = a
    } else {
      const ca = Math.sin((1 - t) * omega) / sinOmega
      const cb = Math.sin(t * omega) / sinOmega
      v = [a[0] * ca + b[0] * cb, a[1] * ca + b[1] * cb, a[2] * ca + b[2] * cb]
    }
    const r = (1 + lift * Math.sin(Math.PI * t)) / Math.hypot(v[0], v[1], v[2])
    points.push([v[0] * r, v[1] * r, v[2] * r])
  }
  return points
}

type Marker = { location: [number, number]; size: number }
type Arc = { points: Vec3[]; rgb: string }

/**
 * CMS lanes → what the globe actually draws: cobe markers (one per distinct endpoint, deduped so a
 * shared origin isn't stamped three times) and a coloured great-circle arc per lane. A lane missing
 * either coordinate is dropped rather than rendered at 0,0 in the Gulf of Guinea.
 */
function buildGlobeData(input: GlobeLane[]): { markers: Marker[]; arcs: Arc[]; places: string[] } {
  type PlacedPoint = { label?: string | null; lat: number; lng: number }
  const lanes = input.filter(
    (l): l is { from: PlacedPoint; to: PlacedPoint; color?: string | null } =>
      typeof l?.from?.lat === 'number' &&
      typeof l?.from?.lng === 'number' &&
      typeof l?.to?.lat === 'number' &&
      typeof l?.to?.lng === 'number',
  )
  if (lanes.length === 0) return { markers: [], arcs: [], places: [] }

  const markers = new Map<string, Marker>()
  const addMarker = (lat: number, lng: number, size: number) => {
    const key = `${lat},${lng}`
    const existing = markers.get(key)
    // A place that is an origin on any lane keeps the origin dot, even if another lane ends there.
    if (existing) existing.size = Math.max(existing.size, size)
    else markers.set(key, { location: [lat, lng], size })
  }

  const arcs: Arc[] = []
  const places: string[] = []
  lanes.forEach((lane, i) => {
    addMarker(lane.from.lat, lane.from.lng, ORIGIN_SIZE)
    addMarker(lane.to.lat, lane.to.lng, DESTINATION_SIZE)
    arcs.push({
      points: greatCircleArc(toVec3([lane.from.lat, lane.from.lng]), toVec3([lane.to.lat, lane.to.lng])),
      rgb: laneColor(lane.color, i).rgb,
    })
    const from = lane.from.label?.trim()
    const to = lane.to.label?.trim()
    if (from && to) places.push(`${from} to ${to}`)
  })

  return { markers: [...markers.values()], arcs, places }
}

/**
 * Rotate a model-space point into view space with cobe's own rotation matrix (its shader builds
 * `mat3 J(theta, phi)` and multiplies on the right, i.e. view = Jᵀ·model ⇒ model → view is J).
 * `z > 0` means the point faces the camera.
 */
function project(p: Vec3, phi: number): Vec3 {
  const ct = Math.cos(THETA)
  const st = Math.sin(THETA)
  const cp = Math.cos(phi)
  const sp = Math.sin(phi)
  return [
    cp * p[0] + sp * p[2],
    sp * st * p[0] + ct * p[1] - cp * st * p[2],
    -sp * ct * p[0] + st * p[1] + cp * ct * p[2],
  ]
}

/** A projected point is behind the globe when it faces away AND sits inside the silhouette. */
const occluded = (v: Vec3): boolean => v[2] < 0 && Math.hypot(v[0], v[1]) < 1

/**
 * WebGL globe (via cobe) replacing the static delivery-network SVG. The globe library is
 * code-split and only fetched once the section scrolls into view. It auto-rotates, zooms in on
 * hover, and can be dragged to spin. A 2D canvas layered on top draws great-circle shipping lanes
 * for every lane authored in the CMS, each carrying a comet that runs origin → destination on a
 * loop in the lane's own flare colour; the lanes share the globe's rotation and hide behind its far
 * side. Honors prefers-reduced-motion (static globe, static lanes, no zoom) and falls back to the
 * original SVG if WebGL/cobe fails.
 */
export default function GlobalDeliveryGlobe({
  className,
  lanes,
}: {
  className?: string
  lanes?: GlobeLane[] | null
}): JSX.Element {
  // Serialize before memoizing: the props array is a fresh reference on every parent render, and
  // rebuilding the arcs would tear down and re-create the WebGL globe each time.
  const lanesKey = JSON.stringify(lanes ?? [])
  const { markers, arcs, places } = useMemo(() => {
    const authored = buildGlobeData(JSON.parse(lanesKey) as GlobeLane[])
    return authored.arcs.length ? authored : buildGlobeData(DEFAULT_LANES)
  }, [lanesKey])

  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const arcsRef = useRef<HTMLCanvasElement>(null)
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
  // Read inside the render loop, so the loop never has to be torn down when the pref flips.
  const animateArcs = useRef(true)

  useEffect(() => {
    autoSpin.current = !reduce
    animateArcs.current = !reduce
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
    const start = performance.now()
    const measure = () => {
      side = canvas.offsetWidth
      const overlay = arcsRef.current
      if (overlay) {
        // Overlay is ARC_PAD wider on each edge than the globe it sits over.
        overlay.width = side * (1 + 2 * ARC_PAD) * dpr
        overlay.height = overlay.width
      }
    }

    // Model space → overlay pixels. cobe maps the sphere to radius 0.8 of the shorter clip axis;
    // the canvas is square, so both axes share one scale. The overlay is bigger than the globe but
    // concentric with it, so the globe's half-side is the scale and the overlay's own centre is the
    // origin. y flips (clip space is bottom-up).
    const toPixels = (v: Vec3, overlayPx: number): [number, number] => {
      const half = (side * dpr) / 2
      const center = overlayPx / 2
      return [center + v[0] * SPHERE_R * half, center - v[1] * SPHERE_R * half]
    }

    const drawArcs = (currentPhi: number, now: number) => {
      const overlay = arcsRef.current
      const ctx = overlay?.getContext('2d')
      if (!overlay || !ctx) return

      const px = overlay.width
      ctx.clearRect(0, 0, px, px)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let a = 0; a < arcs.length; a++) {
        const { points, rgb } = arcs[a]!
        const projected = points.map((p) => project(p, currentPhi))

        // Lane: one path, broken wherever it passes behind the globe.
        ctx.beginPath()
        let penDown = false
        for (let i = 0; i < projected.length; i++) {
          const v = projected[i]!
          if (occluded(v)) {
            penDown = false
            continue
          }
          const [x, y] = toPixels(v, px)
          if (penDown) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
          penDown = true
        }
        ctx.strokeStyle = `rgba(${rgb}, 0.22)`
        ctx.lineWidth = 1 * dpr
        ctx.stroke()

        if (!animateArcs.current) continue

        // Comet: the shipment. Staggered per lane so departures never fire in lockstep.
        const head = (((now - start) / PULSE_MS + a / arcs.length) % 1) * ARC_SEGMENTS
        const tail = head - PULSE_TAIL * ARC_SEGMENTS

        for (let i = Math.max(0, Math.ceil(tail)); i < head; i++) {
          const from = projected[i]!
          const to = projected[i + 1]!
          if (occluded(from) || occluded(to)) continue

          // Brightest at the head, fading back along the trail.
          const fade = 1 - (head - i) / (PULSE_TAIL * ARC_SEGMENTS)
          const [x0, y0] = toPixels(from, px)
          const [x1, y1] = toPixels(to, px)
          ctx.beginPath()
          ctx.moveTo(x0, y0)
          ctx.lineTo(x1, y1)
          ctx.strokeStyle = `rgba(${rgb}, ${0.9 * fade})`
          ctx.lineWidth = (0.8 + 1.6 * fade) * dpr
          ctx.stroke()
        }

        // Glowing head dot, dropped once the comet clears the origin marker.
        const headIndex = Math.min(ARC_SEGMENTS, Math.floor(head))
        const headPoint = projected[headIndex]!
        if (!occluded(headPoint)) {
          const [x, y] = toPixels(headPoint, px)
          ctx.beginPath()
          ctx.arc(x, y, 2.2 * dpr, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rgb}, 0.95)`
          ctx.shadowBlur = 8 * dpr
          ctx.shadowColor = `rgba(${rgb}, 0.8)`
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
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
          theta: THETA,
          dark: 1,
          diffuse: 1.1,
          mapSamples: 16000,
          mapBrightness: 5,
          baseColor: BASE_COLOR,
          markerColor: MARKER_COLOR,
          glowColor: GLOW_COLOR,
          markers,
          onRender: (state: Record<string, number>) => {
            if (autoSpin.current && dragStart.current === null) phi.current += 0.0035
            const currentPhi = phi.current + dragDelta.current
            state.phi = currentPhi
            state.width = side * dpr
            state.height = side * dpr
            // Same frame, same phi — the lanes stay welded to the sphere.
            drawArcs(currentPhi, performance.now())
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
    // `markers`/`arcs` only change when the authored lanes do (they are memoized on a serialized
    // key), so the globe is rebuilt on a content change and never on a plain re-render.
  }, [inView, arcs, markers])

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
    // py-[10%] (== ARC_PAD) reserves the vertical room the overlay bleeds into, so the arcs' peaks
    // clear the neighbouring content instead of being overlapped by it.
    <div ref={wrapRef} className={cn('relative mx-auto w-full max-w-[600px] py-[10%]', className)}>
      <div className="relative aspect-square w-full">
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
          <motion.div style={{ scale: zoom }} className="relative h-full w-full">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={
                places.length
                  ? `Interactive globe showing Ternary delivery routes: ${places.join(', ')}.`
                  : 'Interactive globe showing Ternary delivery routes.'
              }
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              /* 1.08, down from 1.15. The card no longer clips this figure, so the zoom is what
                 decides how far the sphere and its lanes travel outside the frame — 15% put the
                 lanes into the card above and the sphere past the window edge on the right. 8%
                 keeps the same gesture inside the budget documented in globalDeliveryComp. */
              onMouseEnter={() => !reduce && zoom.set(1.08)}
              onMouseLeave={() => zoom.set(1)}
              className="h-full w-full cursor-grab touch-none opacity-0 transition-opacity duration-700 [contain:layout_paint_size]"
              style={{ opacity: mounted ? 1 : undefined }}
            />
            {/* Shipping lanes. Overflows the globe on every edge (see ARC_PAD) so the arcs' peaks
                aren't clipped by the canvas bitmap. Purely decorative and pointer-transparent, so
                every drag/hover gesture still lands on the WebGL canvas underneath.
                h/w are spelled out because <canvas> is a replaced element: opposing insets alone
                leave `width: auto`, which resolves to the bitmap's intrinsic size, not the box. */}
            <canvas
              ref={arcsRef}
              aria-hidden
              className="pointer-events-none absolute -inset-[10%] h-[120%] w-[120%] opacity-0 transition-opacity duration-700"
              style={{ opacity: mounted ? 1 : undefined }}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
