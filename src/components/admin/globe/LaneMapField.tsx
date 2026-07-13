'use client'

import { DEFAULT_LANE_COLOR, laneColor } from '@/components/sections/laneColors'
import { useForm, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect, useMemo, useRef, useState, type JSX, type PointerEvent } from 'react'
import { greatCirclePixels, landDots, MAP_ASPECT, project, round, unproject } from './worldMap'

/**
 * Lane picker — the `map` UI field on the Global Delivery block.
 *
 * The 3D globe on the site can't be edited in place (it spins, and half of it faces away), so this
 * flattens it: the same land, the same lanes, the same flare colours, on a map you can click. It
 * stores nothing of its own. Every pin reads from, and writes back to, the sibling `lanes` array —
 * so the number fields below and this map are always two views of one value, and an editor who
 * prefers typing coordinates can ignore the map entirely.
 *
 * Flow: "Add a lane" puts a fresh row into the array and arms its From, so two clicks on the map
 * draw a whole route — an editor never has to know what latitude Austin is at. Clicking an endpoint
 * chip re-arms it, and pins can be dragged. A drag only writes on release — dispatching on every
 * pointermove would push a form-state update per frame.
 */

type End = 'from' | 'to'
type Point = { label: string | null; lat: number | null; lng: number | null }
type Lane = { from: Point; to: Point; color: string }
type Selection = { row: number; end: End }

const MAP_BG = '#111110'
const DOT = 'rgba(117, 117, 113, 0.85)'
const GRID = 'rgba(117, 117, 113, 0.14)'
const DOT_STEP = 7 // px between land dots, at 1× — dense enough to read as coastline, cheap to draw
const HIT_RADIUS = 12 // px around a pin that counts as grabbing it

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const placed = (p: Point): p is Point & { lat: number; lng: number } => isNum(p.lat) && isNum(p.lng)

const btn = (active: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  borderRadius: 999,
  border: `1px solid ${active ? 'var(--theme-text)' : 'var(--theme-elevation-200)'}`,
  background: active ? 'var(--theme-elevation-100)' : 'transparent',
  color: 'var(--theme-text)',
  font: 'inherit',
  fontSize: 12,
  cursor: 'pointer',
})

/** Swap the last segment of a dotted path for another field name. */
const sibling = (p: string, name: string): string => (p.includes('.') ? `${p.replace(/\.[^.]+$/, '')}.${name}` : name)

export default function LaneMapField({ path, schemaPath }: { path: string; schemaPath?: string }): JSX.Element {
  const { addFieldRow, dispatchFields, setModified } = useForm()

  // `path` is this UI field's own path (e.g. `layout.3.map`); the array we edit is its sibling.
  // `schemaPath` is the same position in the *config* (`layout.globalDeliverySection.map`), which is
  // what addFieldRow needs to build a new row's field state.
  const lanesPath = useMemo(() => sibling(path, 'lanes'), [path])
  const lanesSchemaPath = useMemo(() => (schemaPath ? sibling(schemaPath, 'lanes') : null), [schemaPath])

  // Subscribing with a *string* selector matters: useFormFields re-renders on reference change, and
  // the document form updates its state on every keystroke anywhere in the page. Serializing means
  // this component only re-renders when a lane coordinate/colour actually changes.
  const serialized = useFormFields(([fields]) => {
    const rows = fields[lanesPath]?.rows ?? []
    const at = (row: number, key: string): unknown => fields[`${lanesPath}.${row}.${key}`]?.value ?? null
    return JSON.stringify(
      rows.map((_row, i) => ({
        from: { label: at(i, 'from.label'), lat: at(i, 'from.lat'), lng: at(i, 'from.lng') },
        to: { label: at(i, 'to.label'), lat: at(i, 'to.lat'), lng: at(i, 'to.lng') },
        color: at(i, 'color') ?? DEFAULT_LANE_COLOR,
      })),
    )
  })
  const lanes = useMemo(() => JSON.parse(serialized) as Lane[], [serialized])

  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const [dots, setDots] = useState<[number, number][]>([])
  const [armed, setArmed] = useState<Selection | null>(null)
  // Live position of the pin being dragged. Local so the drag stays at 60fps; committed on release.
  const [drag, setDrag] = useState<(Selection & { lat: number; lng: number }) | null>(null)
  const [hover, setHover] = useState<[number, number] | null>(null)

  // Derived, not stored: deleting a lane row would otherwise leave the selection pointing past the
  // end of the array until an effect cleaned it up.
  const selected = armed && armed.row < lanes.length ? armed : null

  const commit = useCallback(
    (row: number, end: End, lat: number, lng: number) => {
      dispatchFields({ type: 'UPDATE', path: `${lanesPath}.${row}.${end}.lat`, value: round(lat) })
      dispatchFields({ type: 'UPDATE', path: `${lanesPath}.${row}.${end}.lng`, value: round(lng) })
      setModified(true)
    },
    [dispatchFields, lanesPath, setModified],
  )

  /** New row, armed at its From, so the next two map clicks draw the lane. */
  const addLane = useCallback(() => {
    if (!lanesSchemaPath) return
    const row = lanes.length
    addFieldRow({ path: lanesPath, schemaPath: lanesSchemaPath, rowIndex: row })
    setModified(true)
    setArmed({ row, end: 'from' })
  }, [addFieldRow, lanes.length, lanesPath, lanesSchemaPath, setModified])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setSize({ w, h: Math.round(w / MAP_ASPECT) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!size.w) return
    let cancelled = false
    void landDots(size.w, size.h, DOT_STEP).then((d) => {
      if (!cancelled) setDots(d)
    })
    return () => {
      cancelled = true
    }
  }, [size.w, size.h])

  // Paint. Cheap enough (a few thousand dots) to redraw wholesale on every hover frame.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !size.w) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const { w, h } = size
    ctx.fillStyle = MAP_BG
    ctx.fillRect(0, 0, w, h)

    // Equator and prime meridian — the only two lines an editor actually uses to sanity-check a pin.
    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    ctx.beginPath()
    const [, equatorY] = project(0, 0, w, h)
    const [meridianX] = project(0, 0, w, h)
    ctx.moveTo(0, equatorY)
    ctx.lineTo(w, equatorY)
    ctx.moveTo(meridianX, 0)
    ctx.lineTo(meridianX, h)
    ctx.stroke()

    ctx.fillStyle = DOT
    for (const [x, y] of dots) {
      ctx.beginPath()
      ctx.arc(x, y, 1.15, 0, Math.PI * 2)
      ctx.fill()
    }

    // Where each pin currently is: the stored value, unless it is the one under the cursor.
    const pointAt = (row: number, end: End): Point => {
      if (drag && drag.row === row && drag.end === end)
        return { label: lanes[row]![end].label, lat: drag.lat, lng: drag.lng }
      return lanes[row]![end]
    }

    lanes.forEach((lane, row) => {
      const color = laneColor(lane.color, row)
      const from = pointAt(row, 'from')
      const to = pointAt(row, 'to')
      if (!placed(from) || !placed(to)) return
      ctx.strokeStyle = `rgba(${color.rgb}, 0.55)`
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      for (const run of greatCirclePixels([from.lat, from.lng], [to.lat, to.lng], w, h)) {
        ctx.beginPath()
        run.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
        ctx.stroke()
      }
    })

    lanes.forEach((lane, row) => {
      const color = laneColor(lane.color, row)
      for (const end of ['from', 'to'] as End[]) {
        const p = pointAt(row, end)
        if (!placed(p)) continue
        const [x, y] = project(p.lat, p.lng, w, h)
        const active = selected?.row === row && selected.end === end
        const r = end === 'from' ? 5 : 4

        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.rgb}, ${active ? 1 : 0.9})`
        ctx.shadowBlur = active ? 12 : 6
        ctx.shadowColor = `rgba(${color.rgb}, 0.9)`
        ctx.fill()
        ctx.shadowBlur = 0

        if (active) {
          ctx.beginPath()
          ctx.arc(x, y, r + 4, 0, Math.PI * 2)
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        const name = p.label?.trim()
        if (name) {
          ctx.font = '11px system-ui, sans-serif'
          ctx.fillStyle = `rgba(${color.rgb}, 0.9)`
          ctx.textBaseline = 'middle'
          // Flip the label to the left edge near the map's right margin so it never runs off.
          const width = ctx.measureText(name).width
          const left = x + 9 + width > w
          ctx.fillText(name, left ? x - 9 - width : x + 9, y)
        }
      }
    })

    // Crosshair: what the click is about to pick.
    if (hover && selected) {
      const [x, y] = hover
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [dots, drag, hover, lanes, selected, size])

  const toMap = (e: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  /** The pin under the cursor, if any — nearest first, so overlapping pins are still reachable. */
  const pinAt = useCallback(
    (x: number, y: number): Selection | null => {
      let hit: Selection | null = null
      let closest = Infinity
      lanes.forEach((lane, row) => {
        for (const end of ['from', 'to'] as End[]) {
          const p = lane[end]
          if (!placed(p)) continue
          const [px, py] = project(p.lat, p.lng, size.w, size.h)
          const d = Math.hypot(px - x, py - y)
          if (d <= HIT_RADIUS && d < closest) {
            closest = d
            hit = { row, end }
          }
        }
      })
      return hit
    },
    [lanes, size],
  )

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!lanes.length) return
    const [x, y] = toMap(e)
    const hit = pinAt(x, y)

    if (hit) {
      setArmed(hit)
      const [lat, lng] = unproject(x, y, size.w, size.h)
      setDrag({ ...hit, lat, lng })
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }
    // Empty map + an armed endpoint = place it there.
    if (selected) {
      const [lat, lng] = unproject(x, y, size.w, size.h)
      commit(selected.row, selected.end, lat, lng)
      // Placing a From walks on to the To of the same lane, so a new route is just two clicks.
      const next = lanes[selected.row]?.to
      setArmed(selected.end === 'from' && next && !placed(next) ? { row: selected.row, end: 'to' } : null)
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = toMap(e)
    setHover([x, y])
    if (!drag) return
    const [lat, lng] = unproject(x, y, size.w, size.h)
    setDrag({ ...drag, lat, lng })
  }

  const endDrag = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drag) return
    commit(drag.row, drag.end, drag.lat, drag.lng)
    setDrag(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const readout = (() => {
    if (!selected) return null
    const p = lanes[selected.row]?.[selected.end]
    if (!p) return null
    const live = drag && drag.row === selected.row && drag.end === selected.end ? drag : null
    const lat = live?.lat ?? p.lat
    const lng = live?.lng ?? p.lng
    if (!isNum(lat) || !isNum(lng)) return 'not placed yet — click the map'
    return `${round(lat)}, ${round(lng)}`
  })()

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <span className="field-label" style={{ fontWeight: 600 }}>
          Delivery Map
        </span>
        <p style={{ margin: '4px 0 0', color: 'var(--theme-elevation-500)', fontSize: 12, lineHeight: 1.5 }}>
          The globe’s lanes, flattened.{' '}
          <strong>Add a lane, then click the map where it starts and where it ends</strong> — the map reads off the
          coordinates for you. Click a pin to re-arm it, or drag it to move it. Everything you pin lands in the
          Latitude/Longitude fields under Shipping Lanes, which you can also type into directly.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center' }}>
        {lanesSchemaPath && (
          <button type="button" onClick={addLane} style={{ ...btn(false), fontWeight: 600 }}>
            + Add a lane
          </button>
        )}

        {lanes.length === 0 ? (
          <span style={{ fontSize: 12, color: 'var(--theme-elevation-500)' }}>
            No lanes yet — the globe is drawing its built-in Dhaka → United States routes.
          </span>
        ) : (
          lanes.map((lane, row) =>
            (['from', 'to'] as End[]).map((end) => {
              const active = selected?.row === row && selected.end === end
              const p = lane[end]
              const name = p.label?.trim() || (placed(p) ? `${round(p.lat)}, ${round(p.lng)}` : 'unset')
              return (
                <button
                  key={`${row}-${end}`}
                  type="button"
                  onClick={() => setArmed(active ? null : { row, end })}
                  style={btn(active)}
                  aria-pressed={active}
                >
                  <span
                    aria-hidden
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      marginRight: 6,
                      background: laneColor(lane.color, row).hex,
                    }}
                  />
                  {row + 1} · {end === 'from' ? 'From' : 'To'} — {name}
                </button>
              )
            }),
          )
        )}
        {readout && <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--theme-elevation-500)' }}>{readout}</span>}
      </div>

      <div ref={wrapRef} style={{ width: '100%', borderRadius: 8, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={
            lanes.length
              ? `World map with ${lanes.length} shipping lane${lanes.length === 1 ? '' : 's'} pinned. The same coordinates are editable as number fields below.`
              : 'World map with no shipping lanes pinned yet.'
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={(e) => {
            setHover(null)
            endDrag(e)
          }}
          style={{
            display: 'block',
            width: '100%',
            height: size.h || 'auto',
            touchAction: 'none',
            cursor: !lanes.length ? 'default' : drag ? 'grabbing' : selected ? 'crosshair' : 'pointer',
          }}
        />
      </div>
    </div>
  )
}
