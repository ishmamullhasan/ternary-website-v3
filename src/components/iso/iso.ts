/**
 * The 2:1 dimetric projector every isometric figure on the site is built on.
 *
 * Forms are described in world coordinates (x right, y depth, z up) and projected, so
 * the geometry is true rather than faked with skews, and markup is produced as a plain
 * string — no DOM APIs, so it renders on the server.
 *
 * It lives in a module with NO 'use client', deliberately. It used to sit inside
 * SolutionsFrame, and a plain function exported from a client module cannot be CALLED
 * by a Server Component — only rendered as one — so any server-rendered figure that
 * reached for it failed at runtime. Keeping the projector server-safe means either kind
 * of component can build art with it.
 *
 * Stroke classes (`ink`, `hi`, `faint`, `dash`, `solid`, `occ`) are styled by
 * solutionsFrame.css — import that wherever a figure built with this is rendered.
 */

export const MID = 210

export type P3 = [number, number, number]
export type P2 = [number, number]

/** A projector bound to one scene's scale (K) and vertical offset (OY). */
export function iso(K: number, OY: number) {
  const out: string[] = []
  const n = (v: number): string => v.toFixed(2)
  const pr = (p: P3): P2 => [(p[0] - p[1]) * K, MID + OY + ((p[0] + p[1]) * K) / 2 - p[2] * K]
  const S = (s: P2): string => `${n(s[0])},${n(s[1])}`
  const push = (s: string): void => void out.push(s)

  /** Rounded closed polygon through already-projected points. */
  const rpoly = (pts: P2[], r: number): string => {
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
      const pa: P2 = [p[0] + (va[0] / la) * rr, p[1] + (va[1] / la) * rr]
      const pb: P2 = [p[0] + (vb[0] / lb) * rr, p[1] + (vb[1] / lb) * rr]
      d += (i === 0 ? `M${S(pa)} ` : `L${S(pa)} `) + `Q${S(p)} ${S(pb)} `
    }
    return d + 'Z'
  }
  /** Rounded open polyline through already-projected points. */
  const ropen = (pts: P2[], r: number): string => {
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
      const pa: P2 = [p[0] + (va[0] / la) * rr, p[1] + (va[1] / la) * rr]
      const pb: P2 = [p[0] + (vb[0] / lb) * rr, p[1] + (vb[1] / lb) * rr]
      d += `L${S(pa)} Q${S(p)} ${S(pb)} `
    }
    return d + `L${S(pts[m - 1])} `
  }

  const api = {
    pr,
    S,
    n,
    /** Open a wrapper group (e.g. to carry an animation class). */
    open: (cls?: string, style?: string): void =>
      push(`<g${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}>`),
    close: (): void => push('</g>'),
    raw: push,
    /** Rounded isometric box: footprint centre (cx,cy), from z0 up by h. */
    box: (cx: number, cy: number, z0: number, hx: number, hy: number, h: number, r: number, cls = 'ink'): void => {
      const zt = z0 + h
      const T = pr([cx - hx, cy - hy, zt])
      const R = pr([cx + hx, cy - hy, zt])
      const F = pr([cx + hx, cy + hy, zt])
      const L = pr([cx - hx, cy + hy, zt])
      const Rb = pr([cx + hx, cy - hy, z0])
      const Fb = pr([cx + hx, cy + hy, z0])
      const Lb = pr([cx - hx, cy + hy, z0])
      // Occluder — the box's silhouette, so whatever is painted behind it is hidden.
      // It walks the OUTLINE only: T→R→Rb→Fb→Lb→L. `F` is the top face's front corner,
      // which sits INSIDE that hexagon; including it (as this did) makes the path detour
      // through its own middle, and under the default nonzero fill rule the side-face
      // region winds to zero and renders transparent. The visible symptom is background
      // lines showing through the lower half of every box.
      push(`<path d="${rpoly([T, R, Rb, Fb, Lb, L], r)}" class="occ"/>`)
      push(`<path d="${rpoly([T, R, F, L], r)}" class="${cls}"/>`)
      push(`<path d="${ropen([R, Rb, Fb, Lb, L], r)}" class="${cls}"/>`)
      push(`<path d="${ropen([F, Fb], Math.min(r, (h * K) / 2))}" class="${cls}"/>`)
    },
    /** Flat top-face outline — a ghost footprint, or a thin plate's face. */
    face: (cx: number, cy: number, z: number, hx: number, hy: number, r: number, cls: string): void => {
      push(
        `<path d="${rpoly(
          [pr([cx - hx, cy - hy, z]), pr([cx + hx, cy - hy, z]), pr([cx + hx, cy + hy, z]), pr([cx - hx, cy + hy, z])],
          r,
        )}" class="${cls}"/>`,
      )
    },
    line: (a: P3, b: P3, cls: string): void => {
      const p = pr(a)
      const q = pr(b)
      push(`<line x1="${n(p[0])}" y1="${n(p[1])}" x2="${n(q[0])}" y2="${n(q[1])}" class="${cls}"/>`)
    },
    /** Arrowhead at b, pointing along a→b (built in screen space so it stays crisp). */
    arrow: (a: P3, b: P3, cls: string): void => {
      const p = pr(a)
      const q = pr(b)
      const dx = q[0] - p[0]
      const dy = q[1] - p[1]
      const L = Math.hypot(dx, dy) || 1
      const ux = dx / L
      const uy = dy / L
      const s = 5
      const l: P2 = [q[0] - ux * s - uy * s * 0.55, q[1] - uy * s + ux * s * 0.55]
      const r: P2 = [q[0] - ux * s + uy * s * 0.55, q[1] - uy * s - ux * s * 0.55]
      push(`<path d="M${S(l)} L${S(q)} L${S(r)}" class="${cls}"/>`)
    },
    done: (): string => out.join(''),
  }
  return api
}
