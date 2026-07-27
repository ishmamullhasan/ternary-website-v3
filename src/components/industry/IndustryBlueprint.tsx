import type { JSX } from 'react'
import './industryBlueprint.css'

/**
 * Isometric monoline illustration for a homepage industry card — one artwork per sector, selected by
 * keyword on the title so it is robust to slug/title variations.
 *
 * Hand-authored as VECTOR (not a raster image): every edge is a real <path>/<line>/<ellipse>, so the
 * art stays razor-sharp at any size and each stroke can later be draw-animated on scroll (give a stroke
 * a `pathLength` + dash offset and it "draws in"). Filled silhouettes use the card ground colour (#0F0E0E)
 * to occlude edges behind them, giving correct painter's-order depth.
 *
 * Geometry primitives (rpoly/ropen/box/grid) are ported from the isometric construction system: a 2:1
 * dimetric projection where every box is a top face + body silhouette + front vertical edge.
 */

const BG = '#0F0E0E'

type Pt = [number, number]
type El =
  | { k: 'fill'; d: string }
  | { k: 'p'; d: string; c?: string }
  | { k: 'l'; x1: number; y1: number; x2: number; y2: number; c?: string }
  | { k: 'e'; cx: number; cy: number; rx: number; ry: number; c?: string }
  | { k: 'c'; cx: number; cy: number; r: number; c?: string }
  | { k: 'r'; x: number; y: number; w: number; h: number; rx: number; c?: string; tr?: string }

/** Rounded closed polygon: quadratic corners of radius r (clamped to half the shorter adjacent edge). */
function rpoly(pts: Pt[], r: number): string {
  const n = pts.length
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n]
    const p = pts[i]
    const b = pts[(i + 1) % n]
    const va: Pt = [a[0] - p[0], a[1] - p[1]]
    const vb: Pt = [b[0] - p[0], b[1] - p[1]]
    const la = Math.hypot(va[0], va[1])
    const lb = Math.hypot(vb[0], vb[1])
    const rr = Math.min(r, la / 2, lb / 2)
    const pa: Pt = [p[0] + (va[0] / la) * rr, p[1] + (va[1] / la) * rr]
    const pb: Pt = [p[0] + (vb[0] / lb) * rr, p[1] + (vb[1] / lb) * rr]
    d += (i === 0 ? `M${pa} ` : `L${pa} `) + `Q${p} ${pb} `
  }
  return d + 'Z'
}

/** Rounded open polyline: same corner treatment, endpoints left square. */
function ropen(pts: Pt[], r: number): string {
  const n = pts.length
  let d = `M${pts[0]} `
  for (let i = 1; i < n - 1; i++) {
    const a = pts[i - 1]
    const p = pts[i]
    const b = pts[i + 1]
    const va: Pt = [a[0] - p[0], a[1] - p[1]]
    const vb: Pt = [b[0] - p[0], b[1] - p[1]]
    const la = Math.hypot(va[0], va[1])
    const lb = Math.hypot(vb[0], vb[1])
    const rr = Math.min(r, la / 2, lb / 2)
    const pa: Pt = [p[0] + (va[0] / la) * rr, p[1] + (va[1] / la) * rr]
    const pb: Pt = [p[0] + (vb[0] / lb) * rr, p[1] + (vb[1] / lb) * rr]
    d += `L${pa} Q${p} ${pb} `
  }
  d += `L${pts[n - 1]} `
  return d
}

/** Rounded isometric box. cx,cy = centre of the top face, W = half-width, H = extruded height. */
function box(cx: number, cy: number, W: number, H: number, r: number): El[] {
  const hh = W / 2
  const L: Pt = [cx - W, cy]
  const T: Pt = [cx, cy - hh]
  const R: Pt = [cx + W, cy]
  const F: Pt = [cx, cy + hh]
  const Lb: Pt = [cx - W, cy + H]
  const Fb: Pt = [cx, cy + hh + H]
  const Rb: Pt = [cx + W, cy + H]
  return [
    { k: 'fill', d: rpoly([T, R, Rb, Fb, Lb, L], r) }, // outer silhouette fill → occludes what's behind
    { k: 'p', d: rpoly([L, T, R, F], r) }, // top face
    { k: 'p', d: ropen([L, Lb, Fb, Rb, R], r) }, // body silhouette
    { k: 'p', d: ropen([F, Fb], Math.min(r, H / 2)) }, // front vertical edge
  ]
}

/** Dotted iso ground diamond + crosshair, the shared "construction" motif under each object. */
function grid(cx: number, cy: number, rx: number): El[] {
  const ry = rx / 2
  return [
    { k: 'p', c: 'gr', d: `M${cx - rx} ${cy} L${cx} ${cy - ry} L${cx + rx} ${cy} L${cx} ${cy + ry} Z` },
    {
      k: 'p',
      c: 'gr',
      d: `M${cx - 4} ${cy + ry + 12} L${cx + 4} ${cy + ry + 20} M${cx + 4} ${cy + ry + 12} L${cx - 4} ${cy + ry + 20}`,
    },
  ]
}

/** Vertical dotted guide line. */
function guide(x: number, y1: number, y2: number): El {
  return { k: 'l', c: 'gr', x1: x, y1, x2: x, y2 }
}

// ---- 1. BANKING — tapered stacked vault + disc emblem ----
function banking(): El[] {
  return [
    ...grid(130, 175, 86),
    guide(78, 84, 150),
    guide(182, 84, 150),
    ...box(130, 150, 66, 12, 13),
    ...box(130, 132, 58, 12, 13),
    ...box(130, 113, 50, 12, 13),
    ...box(130, 92, 42, 14, 13),
    { k: 'e', cx: 130, cy: 84, rx: 20, ry: 10 },
    { k: 'e', cx: 130, cy: 84, rx: 11, ry: 5.5, c: 'ln dim' },
    { k: 'c', cx: 130, cy: 84, r: 2.4 },
  ]
}

// ---- 2. MANUFACTURING — base, cubes, robot arm + gripper ----
function manufacturing(): El[] {
  return [
    ...grid(130, 182, 82),
    ...box(130, 158, 66, 14, 10),
    ...box(108, 130, 20, 26, 7),
    ...box(150, 134, 22, 28, 7),
    ...box(86, 122, 10, 16, 5),
    { k: 'p', d: 'M86 114 L118 84' },
    { k: 'p', d: 'M118 84 L150 106' },
    { k: 'c', cx: 118, cy: 84, r: 4.5 },
    { k: 'c', cx: 86, cy: 114, r: 3.4 },
    { k: 'p', c: 'ln thin', d: 'M150 106 l-6 6 M150 106 l6 5' },
  ]
}

// ---- 3. HEALTH CARE — five-pod cross ----
function health(): El[] {
  const CX = 130
  const CY = 112
  return [
    ...grid(CX, CY + 30, 86),
    ...box(CX, CY - 50, 37, 22, 10),
    ...box(CX - 72, CY - 8, 37, 22, 10),
    ...box(CX + 72, CY - 8, 37, 22, 10),
    ...box(CX, CY, 34, 22, 10),
    ...box(CX, CY + 50, 37, 22, 10),
    { k: 'p', c: 'ln dim', d: `M${CX - 8} ${CY - 4} L${CX + 8} ${CY + 4} M${CX + 8} ${CY - 4} L${CX - 8} ${CY + 4}` },
  ]
}

// ---- 4. SPORTS — stadium bowl + field + screen + floodlights ----
function sports(): El[] {
  return [
    ...grid(130, 182, 90),
    ...box(130, 112, 84, 16, 26),
    { k: 'e', cx: 130, cy: 112, rx: 42, ry: 21, c: 'ln dim' },
    { k: 'e', cx: 130, cy: 112, rx: 26, ry: 13, c: 'ln dim' },
    { k: 'l', x1: 178, y1: 80, x2: 178, y2: 66, c: 'ln thin' },
    { k: 'r', x: 168, y: 46, w: 22, h: 16, rx: 3 },
    { k: 'l', x1: 60, y1: 94, x2: 60, y2: 74, c: 'ln thin' },
    { k: 'r', x: 52, y: 60, w: 16, h: 12, rx: 2, c: 'ln thin' },
    { k: 'l', x1: 200, y1: 94, x2: 200, y2: 74, c: 'ln thin' },
    { k: 'r', x: 192, y: 60, w: 16, h: 12, rx: 2, c: 'ln thin' },
  ]
}

// ---- 5. CONSUMER — three-tier shelving with product boxes ----
function consumer(): El[] {
  return [
    ...grid(130, 186, 84),
    ...box(130, 168, 62, 10, 6),
    ...box(130, 140, 62, 10, 6),
    ...box(130, 112, 62, 10, 6),
    guide(68, 112, 178),
    guide(192, 112, 178),
    ...box(112, 150, 14, 14, 5),
    ...box(150, 152, 14, 14, 5),
    ...box(110, 122, 14, 14, 5),
    ...box(148, 124, 14, 14, 5),
    ...box(132, 96, 14, 14, 5),
  ]
}

// ---- 6. HOSPITALITY — hotel tower + dome + suitcase ----
function hospitality(): El[] {
  const windows: El[] = ([
    [102, 120],
    [112, 126],
    [122, 132],
    [102, 138],
    [112, 144],
    [122, 150],
  ] as Pt[]).map(([x, y]) => ({ k: 'c', cx: x, cy: y, r: 2, c: 'ln thin' }))
  return [
    ...grid(130, 190, 84),
    ...box(120, 168, 64, 12, 10),
    ...box(120, 152, 54, 10, 8),
    ...box(112, 96, 30, 66, 10),
    ...windows,
    { k: 'e', cx: 112, cy: 84, rx: 10, ry: 5 },
    { k: 'p', d: 'M104 84 Q112 70 120 84' },
    { k: 'c', cx: 112, cy: 68, r: 2.4 },
    ...box(168, 150, 16, 20, 6),
    { k: 'p', c: 'ln thin', d: 'M162 132 q6 -8 12 0' },
  ]
}

// ---- 7. TECHNOLOGY — connected node platform ----
function technology(): El[] {
  const CX = 130
  const CY = 120
  const nodes: Pt[] = [
    [CX, CY - 58],
    [CX - 60, CY - 24],
    [CX + 60, CY - 24],
    [CX - 60, CY + 24],
    [CX + 60, CY + 24],
    [CX, CY + 58],
  ]
  return [
    ...grid(CX, CY + 40, 86),
    ...nodes.map((n): El => ({ k: 'l', c: 'gr', x1: CX, y1: CY, x2: n[0], y2: n[1] })),
    ...box(CX, CY, 30, 16, 10),
    ...box(CX, CY - 16, 26, 10, 9),
    ...nodes.flatMap((n) => box(n[0], n[1], 16, 9, 7)),
    { k: 'r', x: CX - 5, y: CY - 8, w: 10, h: 10, rx: 2, tr: `rotate(45 ${CX} ${CY - 3})`, c: 'ln dim' },
  ]
}

// ---- 8. PUBLIC SECTOR — columned government building + flag ----
function publicsector(): El[] {
  return [
    ...grid(130, 182, 86),
    guide(80, 80, 150),
    guide(180, 80, 150),
    ...box(130, 166, 72, 10, 8),
    ...box(130, 152, 62, 10, 8),
    ...[98, 114, 130, 146, 162].map((cx): El => ({ k: 'r', x: cx - 3, y: 112, w: 6, h: 36, rx: 3 })),
    ...box(130, 102, 58, 12, 8),
    ...box(130, 84, 38, 12, 8),
    { k: 'l', x1: 130, y1: 72, x2: 130, y2: 50, c: 'ln thin' },
    { k: 'p', d: 'M130 50 L150 55 L130 61 Z' },
  ]
}

function elementsFor(title: string): El[] {
  const t = title.toLowerCase()
  if (/bank|capital|financ|invest/.test(t)) return banking()
  if (/manufactur|industrial|energy|supply/.test(t)) return manufacturing()
  if (/health|care|medic|life science/.test(t)) return health()
  if (/sport|entertain|media|leisure/.test(t)) return sports()
  if (/consumer|goods|retail|commerce/.test(t)) return consumer()
  if (/hospitalit|travel|tourism/.test(t)) return hospitality()
  if (/tech|platform|software|digital|saas|cloud/.test(t)) return technology()
  return publicsector()
}

function renderEl(e: El, i: number): JSX.Element {
  switch (e.k) {
    case 'fill':
      return <path key={i} d={e.d} fill={BG} stroke="none" />
    case 'p':
      return <path key={i} d={e.d} className={e.c ?? 'ln'} />
    case 'l':
      return <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className={e.c ?? 'ln'} />
    case 'e':
      return <ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} className={e.c ?? 'ln'} />
    case 'c':
      return <circle key={i} cx={e.cx} cy={e.cy} r={e.r} className={e.c ?? 'ln'} />
    case 'r':
      return (
        <rect key={i} x={e.x} y={e.y} width={e.w} height={e.h} rx={e.rx} transform={e.tr} className={e.c ?? 'ln'} />
      )
  }
}

export default function IndustryBlueprint({
  title,
  className,
}: {
  title?: string | null
  className?: string
}): JSX.Element {
  const els = elementsFor(title ?? '')
  return (
    <svg
      className={`ib${className ? ` ${className}` : ''}`}
      viewBox="0 0 260 240"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable={false}
    >
      {els.map(renderEl)}
    </svg>
  )
}
