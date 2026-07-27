import type { JSX } from 'react'
import './scaleFigure.css'

/**
 * Three scales, three claims. Each figure renders the sentence on its own card
 * and nothing else:
 *
 *   Startups   — output climbs, headcount doesn't
 *   Enterprise — swapped agent by agent, flow never stops
 *   Public     — append-only, nothing above ever changes
 *
 * Hairlines on the ink surface, one tone, no dependencies. Decorative — the
 * card's own title and body carry the meaning — so each figure is aria-hidden.
 */

/* 01 — "Ship like a seed round. Scale like a Series D. Without the headcount
   bill for either." Two traces from one origin: one steps up, one stays flat.
   The widening gap between them is the whole pitch. */
function Growth(): JSX.Element {
  const steps: [number, number][] = [
    [30, 158],
    [66, 158],
    [66, 132],
    [102, 132],
    [102, 108],
    [138, 108],
    [138, 82],
    [174, 82],
    [174, 58],
    [222, 58],
  ]
  const climb = steps.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('')
  const heightAt = (x: number): number => {
    let y = 158
    for (const [sx, sy] of steps) if (sx <= x) y = sy
    return y
  }
  return (
    <svg viewBox="0 0 260 220" fill="none" className="sc-svg" aria-hidden>
      {[66, 102, 138, 174, 210].map((x, i) => (
        <path
          key={i}
          d={`M${x},176 V${heightAt(x)}`}
          className="sc-gap"
          style={{ animationDelay: `${(0.9 + i * 0.13).toFixed(2)}s` }}
        />
      ))}
      <path d="M30,176 H222" className="sc-flat" />
      <path d={climb} className="sc-climb" pathLength="1" strokeDasharray="1" />
      <circle cx="30" cy="167" r="2.6" className="sc-dot" />
      <circle cx="222" cy="58" r="3.4" className="sc-tip" />
    </svg>
  )
}

/* 02 — "Don't rip and replace. Rebuild what runs — agent by agent, without
   breaking Monday morning." The line at the top never breaks. Underneath, one
   unit at a time lifts out and a new one drops in — six units, staggered so
   only one is ever mid-swap. */
function Swap(): JSX.Element {
  const N = 6
  const W = 26
  const GAP = 8
  const CYCLE = 12
  return (
    <svg viewBox="0 0 260 220" fill="none" className="sc-svg" aria-hidden>
      <path d="M24,62 H236" className="sc-flow" />
      <g className="sc-runner" style={{ offsetPath: 'path("M24,62 H236")' }}>
        <circle r="3" className="sc-tip-solid" />
      </g>
      {Array.from({ length: N }, (_, i) => {
        const x = 30 + i * (W + GAP)
        return (
          <g key={i}>
            <path d={`M${x + W / 2},68 V96`} className="sc-tick" />
            <g className="sc-cell" style={{ animationDelay: `${(i * (CYCLE / N)).toFixed(2)}s` }}>
              <rect x={x} y="102" width={W} height="56" rx="2" className="sc-unit" />
              <path d={`M${x + 6},116 h${W - 12}`} className="sc-unit-line" />
              <path d={`M${x + 6},128 h${W - 16}`} className="sc-unit-line" />
            </g>
          </g>
        )
      })}
      <path d="M24,172 H236" className="sc-floor" />
    </svg>
  )
}

/* 03 — "Systems that earn trust. Auditable by default. Secure by design. Built
   for missions measured in decades." An append-only record: new entries arrive
   at the bottom and a verification pass seals each in turn. Nothing above it
   ever moves. */
function Ledger(): JSX.Element {
  const N = 7
  const y0 = 46
  const PITCH = 19
  const widths = [148, 132, 156, 124, 144, 136, 152]
  return (
    <svg viewBox="0 0 260 220" fill="none" className="sc-svg" aria-hidden>
      <path d="M34,36 V196" className="sc-spine" />
      {Array.from({ length: N }, (_, i) => {
        const y = y0 + i * PITCH
        return (
          <g key={i} className={i === N - 1 ? 'sc-append' : undefined}>
            <path d={`M42,${y} h${widths[i]}`} className="sc-record" />
            <rect
              x={42 + widths[i] + 10}
              y={y - 4}
              width="8"
              height="8"
              rx="1"
              className="sc-seal"
              style={{ animationDelay: `${(0.6 + i * 0.16).toFixed(2)}s` }}
            />
          </g>
        )
      })}
      <g className="sc-verify">
        <path d="M34,40 H214" className="sc-scan" />
      </g>
    </svg>
  )
}

const ART = [Growth, Swap, Ledger] as const

/**
 * Pick the figure that matches the authored scale title, so re-ordering in the
 * CMS keeps each card on the right claim rather than relying on position.
 *
 * The patterns cover both the sector names and the way the live cards are
 * actually written ("Cleared engineers. ATO-ready from kickoff.", "Programs
 * measured in quarters, not sprints.", "One pod. Daily ship cadence."), since
 * none of those contain the sector word itself. Index order is the last resort.
 */
export function figureIndexFor(title: string | null | undefined, index: number): number {
  const t = (title ?? '').toLowerCase()
  if (/public|government|defen[cs]e|civic|federal|cleared|\bato\b|accredit|complian/.test(t)) return 2
  if (/enterprise|mid-?market|corporate|legacy|program|quarter|moderni[sz]/.test(t)) return 1
  if (/start-?up|scale-?up|seed|series|founder|smb|\bpod\b|cadence|\bmvp\b/.test(t)) return 0
  return index % ART.length
}

export default function ScaleFigure({ title, index }: { title?: string | null; index: number }): JSX.Element {
  const Art = ART[figureIndexFor(title, index)]
  return <Art />
}
