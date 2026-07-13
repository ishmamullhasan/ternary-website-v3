/**
 * Flat-map geometry for the admin lane picker.
 *
 * The picker has to be exact: an editor clicks a pixel and we store the latitude/longitude that
 * pixel stands for, and the 3D globe then puts a marker there. So the map is drawn with a plain
 * equirectangular projection (latitude and longitude are each linear in pixels) — the one
 * projection whose inverse is trivial and exactly right. Its land comes from Natural Earth's
 * 110m land polygons (the `world-atlas` package), rasterized once and sampled into a dot grid so it
 * reads like the site's dotted delivery map rather than a filled atlas.
 *
 * The latitude range is cropped: below ~56°S there is only Antarctica, and above ~84°N only ice, so
 * showing them would waste a third of the canvas on places nothing ships to. Both projections below
 * respect the crop, so clicks stay accurate — LAT_MAX/LAT_MIN are the map's edges, not the globe's.
 */

export const LAT_MAX = 84
export const LAT_MIN = -56
export const LNG_MAX = 180
export const LNG_MIN = -180

/** width / height of the map at the cropped latitude range. */
export const MAP_ASPECT = (LNG_MAX - LNG_MIN) / (LAT_MAX - LAT_MIN)

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))

/** lat/lng → pixels, in a canvas of `w` × `h`. Out-of-range latitudes clamp to the map's edge. */
export const project = (lat: number, lng: number, w: number, h: number): [number, number] => [
  ((clamp(lng, LNG_MIN, LNG_MAX) - LNG_MIN) / (LNG_MAX - LNG_MIN)) * w,
  ((LAT_MAX - clamp(lat, LAT_MIN, LAT_MAX)) / (LAT_MAX - LAT_MIN)) * h,
]

/** pixels → lat/lng. The exact inverse of `project`, which is what makes a click trustworthy. */
export const unproject = (x: number, y: number, w: number, h: number): [number, number] => [
  LAT_MAX - (clamp(y, 0, h) / h) * (LAT_MAX - LAT_MIN),
  LNG_MIN + (clamp(x, 0, w) / w) * (LNG_MAX - LNG_MIN),
]

/** Coordinates are stored to 4dp — ~11 m, far finer than a marker on a globe can express. */
export const round = (v: number): number => Math.round(v * 1e4) / 1e4

type Ring = [number, number][]
type LandPolygon = Ring[]
type Geometry = { type: string; coordinates: unknown }

let landPromise: Promise<LandPolygon[]> | null = null

/**
 * Natural Earth land polygons as plain [lng, lat] rings. TopoJSON is fetched and decoded once per
 * admin session — it is ~100 KB and only ever loaded inside this (dynamically imported) picker, so
 * it never reaches the public bundle.
 */
const loadLand = async (): Promise<LandPolygon[]> => {
  const [{ feature }, topo] = await Promise.all([import('topojson-client'), import('world-atlas/land-110m.json')])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- world-atlas ships no types
  const topology = ((topo as any).default ?? topo) as any
  // topojson's `feature()` returns a Feature for a single geometry but a FeatureCollection for a
  // GeometryCollection, and which one `objects.land` is depends on the build. Handle both.
  const result = feature(topology, topology.objects.land) as unknown as {
    type: string
    geometry?: Geometry
    features?: { geometry?: Geometry }[]
  }
  const geometries: Geometry[] = (
    result.type === 'FeatureCollection' ? (result.features ?? []).map((f) => f.geometry) : [result.geometry]
  ).filter((g): g is Geometry => Boolean(g))

  const polygons: LandPolygon[] = []
  for (const g of geometries) {
    if (g.type === 'Polygon') polygons.push(g.coordinates as LandPolygon)
    else if (g.type === 'MultiPolygon')
      for (const poly of g.coordinates as unknown[]) polygons.push(poly as LandPolygon)
  }
  return polygons
}

export const land = (): Promise<LandPolygon[]> => (landPromise ??= loadLand())

/**
 * The map as a dot grid: land rasterized to an offscreen canvas, then sampled every `step` pixels.
 * Returns the dot centres, so the caller can draw them in whatever size/colour it likes and redraw
 * cheaply on every hover without touching the polygons again.
 */
export const landDots = async (w: number, h: number, step: number): Promise<[number, number][]> => {
  const polygons = await land()

  const raster = document.createElement('canvas')
  raster.width = Math.max(1, Math.round(w))
  raster.height = Math.max(1, Math.round(h))
  const ctx = raster.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  for (const rings of polygons) {
    for (const ring of rings) {
      ring.forEach(([lng, lat], i) => {
        const [x, y] = project(lat, lng, raster.width, raster.height)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
    }
  }
  // evenodd so a polygon's holes (inland seas) punch through instead of filling solid.
  ctx.fill('evenodd')

  const { data } = ctx.getImageData(0, 0, raster.width, raster.height)
  const dots: [number, number][] = []
  for (let y = step / 2; y < raster.height; y += step) {
    for (let x = step / 2; x < raster.width; x += step) {
      const i = (Math.floor(y) * raster.width + Math.floor(x)) * 4 + 3
      if (data[i]! > 40) dots.push([x, y])
    }
  }
  return dots
}

/**
 * Great-circle path between two points, as flat-map pixel runs. The 3D globe draws its lanes along
 * great circles, so a straight line here would lie about where a lane goes (Dhaka → San Francisco
 * crosses the Arctic, not the Pacific mid-latitudes). Split into runs at the antimeridian: a lane
 * that wraps must break rather than streak back across the whole map.
 */
export const greatCirclePixels = (
  from: [number, number],
  to: [number, number],
  w: number,
  h: number,
  segments = 96,
): [number, number][][] => {
  const DEG = Math.PI / 180
  const toVec = ([lat, lng]: [number, number]): [number, number, number] => [
    Math.cos(lat * DEG) * Math.cos(lng * DEG),
    Math.cos(lat * DEG) * Math.sin(lng * DEG),
    Math.sin(lat * DEG),
  ]
  const a = toVec(from)
  const b = toVec(to)
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  const sin = Math.sin(omega)

  const runs: [number, number][][] = []
  let run: [number, number][] = []
  let prevLng: number | null = null

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    let lat: number
    let lng: number
    if (sin < 1e-6) {
      ;[lat, lng] = from
    } else {
      const ca = Math.sin((1 - t) * omega) / sin
      const cb = Math.sin(t * omega) / sin
      const v: [number, number, number] = [a[0] * ca + b[0] * cb, a[1] * ca + b[1] * cb, a[2] * ca + b[2] * cb]
      lat = Math.atan2(v[2], Math.hypot(v[0], v[1])) / DEG
      lng = Math.atan2(v[1], v[0]) / DEG
    }
    if (prevLng !== null && Math.abs(lng - prevLng) > 180) {
      if (run.length > 1) runs.push(run)
      run = []
    }
    prevLng = lng
    run.push(project(lat, lng, w, h))
  }
  if (run.length > 1) runs.push(run)
  return runs
}
