import type { JSX } from 'react'
import './industryBlueprint.css'

/**
 * Isometric monoline illustration for an industry card — one artwork per sector, selected by keyword
 * on the title so it is robust to slug/title variations.
 *
 * Hand-authored as VECTOR line-art built on a real isometric 3D projector: forms are described in
 * world coordinates (x right, y depth, z up) and projected to a 2:1 dimetric view, so jointed and
 * architectural shapes (robot arm, hotel, temple columns, stadium bowl) stay geometrically true. The
 * art is razor-sharp at any card size and every edge is a real <path>/<line>/<ellipse>, so each stroke
 * can later be draw-animated on scroll. Filled silhouettes use the card ground (BG) to occlude edges
 * behind them, giving correct painter's-order depth.
 *
 * SSR-safe: the SVG markup is built as a pure string (no document/DOM), so it renders on the server.
 */

const BG = '#0F0E0E'
const SQ2 = Math.SQRT2

function draw(key: string): string {
  const out: string[] = []
  let OX = 200
  let OY = 210
  let K = 1

  const pr = (p: number[]): number[] => [OX + (p[0] - p[1]) * K, OY + (p[0] + p[1]) * K * 0.5 - p[2] * K]
  const n = (v: number): string => v.toFixed(2)
  const S = (pt: number[]): string => n(pt[0]) + ',' + n(pt[1])
  const attr = (a: Record<string, string | number>): string =>
    Object.entries(a)
      .map(([k, v]) => `${k}="${typeof v === 'number' ? n(v) : v}"`)
      .join(' ')
  const E = (tag: string, a: Record<string, string | number>): void => void out.push(`<${tag} ${attr(a)}/>`)
  const Pst = (d: string, cls?: string): void => void out.push(`<path d="${d}" class="${cls ?? 'ln'}" fill="none"/>`)
  const Pfl = (d: string): void => void out.push(`<path d="${d}" fill="${BG}" stroke="none"/>`)
  const ln3 = (a: number[], b: number[], cls?: string): void => {
    const p = pr(a)
    const q = pr(b)
    E('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: cls ?? 'ln' })
  }

  // rounded polygon / polyline on already-projected 2D points
  const rpoly2 = (pts: number[][], r: number): string => {
    const m = pts.length
    let d = ''
    for (let i = 0; i < m; i++) {
      const a = pts[(i - 1 + m) % m]
      const p = pts[i]
      const b = pts[(i + 1) % m]
      const va = [a[0] - p[0], a[1] - p[1]]
      const vb = [b[0] - p[0], b[1] - p[1]]
      const la = Math.hypot(va[0], va[1]) || 1
      const lb = Math.hypot(vb[0], vb[1]) || 1
      const rr = Math.min(r, la / 2, lb / 2)
      const pa = [p[0] + (va[0] / la) * rr, p[1] + (va[1] / la) * rr]
      const pb = [p[0] + (vb[0] / lb) * rr, p[1] + (vb[1] / lb) * rr]
      d += (i === 0 ? `M${S(pa)} ` : `L${S(pa)} `) + `Q${S(p)} ${S(pb)} `
    }
    return d + 'Z'
  }
  const ropen2 = (pts: number[][], r: number): string => {
    const m = pts.length
    let d = `M${S(pts[0])} `
    for (let i = 1; i < m - 1; i++) {
      const a = pts[i - 1]
      const p = pts[i]
      const b = pts[i + 1]
      const va = [a[0] - p[0], a[1] - p[1]]
      const vb = [b[0] - p[0], b[1] - p[1]]
      const la = Math.hypot(va[0], va[1]) || 1
      const lb = Math.hypot(vb[0], vb[1]) || 1
      const rr = Math.min(r, la / 2, lb / 2)
      const pa = [p[0] + (va[0] / la) * rr, p[1] + (va[1] / la) * rr]
      const pb = [p[0] + (vb[0] / lb) * rr, p[1] + (vb[1] / lb) * rr]
      d += `L${S(pa)} Q${S(p)} ${S(pb)} `
    }
    d += `L${S(pts[m - 1])} `
    return d
  }
  const rp = (pts3: number[][], r: number): string => rpoly2(pts3.map(pr), r)
  const ro = (pts3: number[][], r: number): string => ropen2(pts3.map(pr), r)

  // general rounded iso box: footprint centre (cx,cy), from z0 up by h, half-extents hx,hy, corner r
  const pbox = (cx: number, cy: number, z0: number, hx: number, hy: number, h: number, r: number, cls?: string): void => {
    const zt = z0 + h
    const T = [cx - hx, cy - hy, zt]
    const R = [cx + hx, cy - hy, zt]
    const F = [cx + hx, cy + hy, zt]
    const L = [cx - hx, cy + hy, zt]
    const Rb = [cx + hx, cy - hy, z0]
    const Fb = [cx + hx, cy + hy, z0]
    const Lb = [cx - hx, cy + hy, z0]
    Pfl(rpoly2([T, R, F, L, Lb, Fb, Rb].map(pr), r))
    Pst(rp([T, R, F, L], r), cls)
    Pst(ro([R, Rb, Fb, Lb, L], r), cls)
    Pst(ro([F, Fb], Math.min(r, (h * K) / 2)), cls)
  }
  const cube = (cx: number, cy: number, z0: number, hx: number, hy: number, h: number, cls?: string): void =>
    pbox(cx, cy, z0, hx, hy, h, 0, cls)

  // projected circle on a horizontal plane -> axis-aligned 2:1 ellipse
  const ellFor = (cx: number, cy: number, z: number, rad: number): { c: number[]; ex: number; ey: number } => {
    const c = pr([cx, cy, z])
    const ex = rad * K * SQ2
    return { c, ex, ey: ex / 2 }
  }
  const ellipse3 = (cx: number, cy: number, z: number, rad: number, cls?: string): void => {
    const e = ellFor(cx, cy, z, rad)
    E('ellipse', { cx: e.c[0], cy: e.c[1], rx: e.ex, ry: e.ey, class: cls ?? 'ln', fill: 'none' })
  }
  const dot3 = (cx: number, cy: number, z: number, rad: number, cls?: string): void => {
    const c = pr([cx, cy, z])
    E('circle', { cx: c[0], cy: c[1], r: rad, class: cls ?? 'ln' })
  }
  const cyl = (cx: number, cy: number, z0: number, rad: number, h: number, cls?: string): void => {
    const t = ellFor(cx, cy, z0 + h, rad)
    const b = ellFor(cx, cy, z0, rad)
    const c = cls ?? 'ln'
    Pfl(
      `M${n(t.c[0] - t.ex)},${n(t.c[1])} A${n(t.ex)},${n(t.ey)} 0 0 0 ${n(t.c[0] + t.ex)},${n(t.c[1])} L${n(b.c[0] + b.ex)},${n(b.c[1])} A${n(b.ex)},${n(b.ey)} 0 0 0 ${n(b.c[0] - b.ex)},${n(b.c[1])} Z`,
    )
    Pfl(
      `M${n(t.c[0] - t.ex)},${n(t.c[1])} A${n(t.ex)},${n(t.ey)} 0 0 1 ${n(t.c[0] + t.ex)},${n(t.c[1])} L${n(b.c[0] + b.ex)},${n(b.c[1])} A${n(b.ex)},${n(b.ey)} 0 0 1 ${n(b.c[0] - b.ex)},${n(b.c[1])} Z`,
    )
    E('line', { x1: t.c[0] - t.ex, y1: t.c[1], x2: b.c[0] - b.ex, y2: b.c[1], class: c })
    E('line', { x1: t.c[0] + t.ex, y1: t.c[1], x2: b.c[0] + b.ex, y2: b.c[1], class: c })
    E('path', { d: `M${n(b.c[0] - b.ex)},${n(b.c[1])} A${n(b.ex)},${n(b.ey)} 0 0 0 ${n(b.c[0] + b.ex)},${n(b.c[1])}`, class: c, fill: 'none' })
    E('ellipse', { cx: t.c[0], cy: t.c[1], rx: t.ex, ry: t.ey, class: c, fill: BG })
  }
  const ground = (cx: number, cy: number, rad: number): void => {
    const a = pr([cx - rad, cy, 0])
    const b = pr([cx, cy - rad, 0])
    const c = pr([cx + rad, cy, 0])
    const d = pr([cx, cy + rad, 0])
    Pst(`M${S(a)} L${S(b)} L${S(c)} L${S(d)} Z`, 'gr')
  }
  const drop = (cx: number, cy: number, z: number): void => ln3([cx, cy, 0], [cx, cy, z], 'gr')

  // ---- shared detail helpers ----
  const joint = (x: number, y: number, z: number): void => {
    const c = pr([x, y, z])
    E('circle', { cx: c[0], cy: c[1], r: 4.5, class: 'ln', fill: BG })
  }
  const armseg = (a: number[], b: number[], w: number): void => {
    const A = pr(a)
    const B = pr(b)
    const dx = B[0] - A[0]
    const dy = B[1] - A[1]
    const L = Math.hypot(dx, dy) || 1
    const nx = (-dy / L) * (w / 2)
    const ny = (dx / L) * (w / 2)
    const p1 = [A[0] + nx, A[1] + ny]
    const p2 = [B[0] + nx, B[1] + ny]
    const p3 = [B[0] - nx, B[1] - ny]
    const p4 = [A[0] - nx, A[1] - ny]
    Pfl(`M${S(p1)} L${S(p2)} L${S(p3)} L${S(p4)} Z`)
    Pst(`M${S(p1)} L${S(p2)} L${S(p3)} L${S(p4)} Z`, 'ln')
  }
  const stadiumRing = (hx: number, hy: number, z: number, r: number): void =>
    Pst(rp([[-hx, -hy, z], [hx, -hy, z], [hx, hy, z], [-hx, hy, z]], r), 'ln')
  const dots = (x: number, y: number, w: number, h: number): void => {
    const cols = Math.max(2, Math.round(w / 8))
    const rows = Math.max(2, Math.round(h / 6))
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++)
        E('circle', { cx: x + 4 + (i * (w - 8)) / (cols - 1), cy: y + 4 + (j * (h - 8)) / (rows - 1), r: 1, class: 'thin' })
  }
  const board = (cx: number, cy: number, z0: number, h: number): void => {
    ln3([cx, cy, 0], [cx, cy, z0 + h - 11], 'ln')
    const c = pr([cx, cy, z0 + h])
    E('rect', { x: c[0] - 8, y: c[1] - 11, width: 16, height: 11, rx: 2, class: 'ln', fill: BG })
    dots(c[0] - 8, c[1] - 11, 16, 11)
  }
  const dome = (cx: number, cy: number, z: number, rad: number): void => {
    const e = ellFor(cx, cy, z, rad)
    E('path', { d: `M${n(e.c[0] - e.ex)},${n(e.c[1])} A${n(e.ex)},${n(e.ex * 1.5)} 0 0 1 ${n(e.c[0] + e.ex)},${n(e.c[1])} Z`, class: 'ln', fill: BG })
  }
  const facewin_y = (x0: number, y: number, z0: number, w: number, h: number, cols: number, rows: number): void => {
    const sw = 6
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const x = x0 + (w * (i + 1)) / (cols + 1) - sw / 2
        const zz = z0 + (h * (j + 0.9)) / (rows + 0.6) - sw / 2
        const a = pr([x, y, zz])
        const b = pr([x + sw, y, zz])
        const c = pr([x + sw, y, zz + sw])
        const d = pr([x, y, zz + sw])
        Pst(`M${S(a)} L${S(b)} L${S(c)} L${S(d)} Z`, 'thin')
      }
  }
  const facewin_x = (x: number, y0: number, z0: number, d0: number, h: number, cols: number, rows: number): void => {
    const sw = 6
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const y = y0 + (d0 * (i + 1)) / (cols + 1) - sw / 2
        const zz = z0 + (h * (j + 0.9)) / (rows + 0.6) - sw / 2
        const a = pr([x, y, zz])
        const b = pr([x, y + sw, zz])
        const c = pr([x, y + sw, zz + sw])
        const d = pr([x, y, zz + sw])
        Pst(`M${S(a)} L${S(b)} L${S(c)} L${S(d)} Z`, 'thin')
      }
  }

  // ---- 1. BANKING — coin on stepped vault ----
  const banking = (): void => {
    OX = 200
    OY = 228
    K = 2.0
    ground(0, 0, 52)
    pbox(0, 0, 0, 46, 46, 6, 7)
    pbox(0, 0, 6, 38, 38, 6, 7)
    pbox(0, 0, 12, 31, 31, 6, 7)
    pbox(0, 0, 18, 42, 42, 7, 8)
    const zt = 25
    ellipse3(0, 0, zt, 20)
    ellipse3(0, 0, zt, 12, 'ln dim')
    Pst(rp([[-3.5, 0, zt], [0, -3.5, zt], [3.5, 0, zt], [0, 3.5, zt]], 2), 'ln dim')
  }

  // ---- 2. MANUFACTURING — robot arm + cubes ----
  const manufacturing = (): void => {
    OX = 205
    OY = 252
    K = 1.6
    ground(4, 8, 60)
    pbox(4, 8, 0, 54, 54, 7, 4)
    cube(-4, 30, 7, 13, 13, 26)
    cube(28, 24, 7, 11, 11, 22)
    drop(-6, -8, 7)
    drop(-6, -8, 50)
    cube(-6, -8, 50, 12, 12, 22)
    cyl(42, -34, 7, 10, 9)
    cube(42, -34, 16, 9, 9, 12)
    joint(42, -34, 28)
    armseg([42, -34, 28], [18, -20, 62], 8)
    joint(18, -20, 62)
    armseg([18, -20, 62], [-6, -8, 74], 7)
    joint(-6, -8, 74)
    ln3([-6, -8, 74], [-6, -8, 70], 'ln')
    ln3([-6, -8, 70], [-12, -14, 66], 'thin')
    ln3([-6, -8, 70], [0, -2, 66], 'thin')
  }

  // ---- 3. HEALTHCARE — plus of rounded pods ----
  const health = (): void => {
    OX = 200
    OY = 205
    K = 1.9
    ground(0, 4, 54)
    const AH = 17
    const r = 9
    const off = 30
    drop(0, -off, 0)
    drop(-off, 0, 0)
    drop(off, 0, 0)
    drop(0, off, 0)
    pbox(0, -off, 0, 17, 17, AH, r)
    pbox(-off, 0, 0, 17, 17, AH, r)
    pbox(off, 0, 0, 17, 17, AH, r)
    pbox(0, 0, 0, 16, 16, AH + 2, r)
    pbox(0, off, 0, 17, 17, AH, r)
    const zt = AH + 2
    Pst(rp([[-6, -6, zt], [6, 6, zt]], 0), 'ln dim')
    Pst(rp([[6, -6, zt], [-6, 6, zt]], 0), 'ln dim')
  }

  // ---- 4. SPORTS — stadium bowl + scoreboard ----
  const sports = (): void => {
    OX = 200
    OY = 200
    K = 0.92
    ground(0, 0, 104)
    pbox(0, 0, 0, 90, 66, 13, 30)
    stadiumRing(78, 56, 10, 26)
    stadiumRing(66, 46, 7, 22)
    for (const [sx, sy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) ln3([sx * 90, sy * 66, 13], [sx * 66, sy * 46, 7], 'ln dim')
    pbox(0, 0, 2, 50, 30, 2, 12)
    ln3([0, -28, 4], [0, 28, 4], 'ln dim')
    ellipse3(0, 0, 4, 9, 'ln dim')
    const gy = -74
    const pz = 6
    const ph = 32
    const pw = 36
    const ptop = 22
    ln3([-15, gy, 0], [-15, gy, pz + ph - ptop], 'ln')
    ln3([15, gy, 0], [15, gy, pz + ph - ptop], 'ln')
    const gc = pr([0, gy, pz + ph])
    E('rect', { x: gc[0] - pw / 2, y: gc[1] - ptop, width: pw, height: ptop, rx: 2, class: 'ln', fill: BG })
    dots(gc[0] - pw / 2, gc[1] - ptop, pw, ptop)
    board(-84, -32, 6, 18)
    board(84, -32, 6, 18)
  }

  // ---- 5. CONSUMER — shelving rack + boxes ----
  const consumer = (): void => {
    OX = 200
    OY = 235
    K = 1.5
    ground(0, 0, 60)
    const W = 46
    const D = 20
    cube(-W, 0, 0, 2, D, 72)
    cube(W, 0, 0, 2, D, 72)
    for (const z of [4, 30, 56]) cube(0, 0, z, W, D, 3)
    cube(-26, -6, 7, 9, 9, 16)
    cube(-4, -6, 7, 10, 10, 18)
    cube(22, -4, 7, 8, 8, 14)
    cube(-22, -4, 33, 9, 9, 16)
    cube(6, -6, 33, 11, 11, 18)
    cube(-14, -6, 59, 9, 9, 15)
    cube(14, -4, 59, 9, 9, 15)
  }

  // ---- 6. HOSPITALITY — hotel building + suitcase ----
  const hospitality = (): void => {
    OX = 200
    OY = 250
    K = 1.5
    ground(0, 0, 58)
    pbox(0, 0, 0, 50, 50, 6, 4)
    pbox(0, 0, 6, 42, 42, 5, 4)
    const bx = -6
    const by = -6
    const bw = 20
    const bd = 20
    const bh = 70
    const bz = 11
    cube(bx, by, bz, bw, bd, bh)
    facewin_y(bx - bw, by + bd, bz, 2 * bw, bh, 3, 4)
    facewin_x(bx + bw, by - bd, bz, 2 * bd, bh, 3, 4)
    const dc = pr([bx, by + bd, bz + 11])
    E('path', {
      d: `M${n(dc[0] - 6)},${n(dc[1] + 11)} L${n(dc[0] - 6)},${n(dc[1] - 1)} A6,6 0 0 1 ${n(dc[0] + 6)},${n(dc[1] - 1)} L${n(dc[0] + 6)},${n(dc[1] + 11)} Z`,
      class: 'ln',
      fill: 'none',
    })
    const droof = bz + bh
    cyl(bx, by, droof, 7, 3)
    dome(bx, by, droof + 3, 7)
    dot3(bx, by, droof + 3 + 10, 2.2)
    pbox(32, 26, 6, 11, 8, 17, 3)
    const sc = pr([32, 26, 6 + 17])
    E('path', { d: `M${n(sc[0] - 5)},${n(sc[1] - 2)} q5,-8 10,0`, class: 'ln', fill: 'none' })
  }

  // ---- 7. TECHNOLOGY — node platform ----
  const technology = (): void => {
    OX = 200
    OY = 205
    K = 1.6
    ground(0, 0, 66)
    const nodes = [[0, -52], [-46, -20], [46, -20], [-46, 26], [46, 26], [0, 58]]
    for (const [x, y] of nodes) drop(x, y, 0)
    for (const [x, y] of nodes) {
      const a = pr([0, 0, 20])
      const b = pr([x, y, 10])
      E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'ln' })
    }
    pbox(0, 0, 0, 26, 26, 8, 10)
    pbox(0, 0, 8, 22, 22, 8, 9)
    Pst(rp([[-6, 0, 16], [0, -6, 16], [6, 0, 16], [0, 6, 16]], 0), 'ln dim')
    for (const [x, y] of nodes) pbox(x, y, 4, 15, 15, 7, 7)
  }

  // ---- 8. GOVERNMENT — classical temple ----
  const government = (): void => {
    OX = 200
    OY = 252
    K = 1.3
    ground(0, 0, 62)
    pbox(0, 0, 0, 56, 48, 6, 3)
    pbox(0, 0, 6, 48, 40, 6, 3)
    pbox(0, 0, 12, 42, 34, 4, 2)
    const cz = 16
    const ch = 40
    for (let i = 0; i < 5; i++) cyl(-34 + i * 17, 26, cz, 4, ch)
    pbox(0, 0, cz + ch, 44, 36, 6, 2)
    pbox(0, 0, cz + ch + 6, 30, 24, 7, 2)
    const fz = cz + ch + 13
    ln3([0, 0, fz], [0, 0, fz + 22], 'thin')
    const ftop = pr([0, 0, fz + 22])
    E('path', { d: `M${n(ftop[0])},${n(ftop[1])} l15,4 l-15,5 Z`, class: 'ln', fill: BG })
  }

  switch (key) {
    case 'banking':
      banking()
      break
    case 'manufacturing':
      manufacturing()
      break
    case 'health':
      health()
      break
    case 'sports':
      sports()
      break
    case 'consumer':
      consumer()
      break
    case 'hospitality':
      hospitality()
      break
    case 'technology':
      technology()
      break
    default:
      government()
  }
  return out.join('')
}

function keyFor(title: string): string {
  const t = title.toLowerCase()
  if (/bank|capital|financ|invest/.test(t)) return 'banking'
  if (/manufactur|industrial|energy|supply/.test(t)) return 'manufacturing'
  if (/health|care|medic|life science/.test(t)) return 'health'
  if (/sport|entertain|media|leisure/.test(t)) return 'sports'
  if (/consumer|goods|retail|commerce/.test(t)) return 'consumer'
  if (/hospitalit|travel|tourism/.test(t)) return 'hospitality'
  if (/tech|platform|software|digital|saas|cloud/.test(t)) return 'technology'
  return 'government'
}

export default function IndustryBlueprint({
  title,
  className,
}: {
  title?: string | null
  className?: string
}): JSX.Element {
  const markup = draw(keyFor(title ?? ''))
  return (
    <svg
      className={`ib${className ? ` ${className}` : ''}`}
      viewBox="0 0 400 360"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable={false}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
