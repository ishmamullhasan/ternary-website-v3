'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from 'react'
import './growthLine.css'

/**
 * The Growth Line — "How you grow" as one scroll-driven system rather than a rail of names above a
 * row of cards.
 *
 * The section pins, the reader travels through it, and the career ladder advances a step at a time:
 * the line fills to the live stage, a signal runs the segment it just gained, and that stage's copy
 * settles in while the previous one lifts away. No new graphic — the progression IS the interaction,
 * which is the point. Industries says where we work through a dial; this says how someone grows
 * through a line; both on the same restrained vocabulary.
 *
 * IT IS CREAM, NOT RED. The brief's red is the annotation colour on the mockup, not a token — the
 * design system has exactly one accent and this is it. The idea it carries over is the real one:
 * the accent marks PROGRESS rather than decorating a border.
 *
 * SAME PINNED-SCROLL CONTRACT AS SectorIndex, including the two bugs that component was fixed for:
 *
 *   - `data-pin` is set here, from JS, and only when reduced motion is off. Without it the
 *     stylesheet leaves the track at its natural height and every stage in normal flow, so the
 *     section degrades to a readable list — not to a pinned stage that never advances.
 *   - The pin is gated to ≥900px in BOTH places. Gating it in CSS alone leaves this file still
 *     computing an active index against a track that is no longer taller than the viewport, which
 *     is how the industries rail ended up translated off-screen on a phone.
 *
 * Every stage is mounted at all times. Keying a single panel on the active index would unmount the
 * outgoing copy, and the brief asks for it to slide up and dissolve — an exit needs an element to
 * still be there. It also means the no-JS rendering is all four stages in flow, in order.
 */

export interface GrowthStage {
  step: string
  body: string
}

/* One beat per stage. What the brief specifies is how long the section stays PINNED, which is the
   track minus one viewport — not the track itself. Pinned travel works out as
   `frame/vh + steps × STEP_VH − 100`, so at a 900px viewport with a ~315px frame, four stages need
   ~60vh each to land inside 150–200vh. At 45 it measured 115vh: the section released while the
   ladder still felt like it was moving. Measured after the change rather than assumed. */
const STEP_VH = 60

export default function GrowthLine({
  stages,
  note,
  head,
}: {
  stages: GrowthStage[]
  note: string
  head: ReactNode
}): JSX.Element {
  const [active, setActive] = useState(0)
  /* Mirrors `data-pin` in React state for one reason: only a PINNED stage may be hidden from the
     accessibility tree. Unpinned — reduced motion, no JS, under 900px — all four stages are on
     screen and readable, and marking three of them aria-hidden would show a sighted reader four
     levels and hand a screen reader one. */
  const [pinned, setPinned] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  const last = Math.max(1, stages.length - 1)

  useEffect(() => {
    const track = trackRef.current
    const pin = pinRef.current
    if (!track || !pin || !stages.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wide = window.matchMedia('(min-width: 900px)')

    let raf = 0
    let ro: ResizeObserver | null = null

    const apply = (): void => {
      raf = 0
      // Gate here as well as in CSS: below 900px the track is its natural height, so `travel` is
      // negative and every reading would clamp to the first stage anyway — but the rail would still
      // be told to fill, and the panels would still be stacked by a stylesheet that is not pinning.
      if (!wide.matches) {
        setActive(0)
        return
      }
      const r = track.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0
      // Nudged off the very end so the last stage holds instead of flickering at p === 1.
      const i = Math.min(stages.length - 1, Math.floor(p * stages.length * 0.999))
      setActive((prev) => (prev === i ? prev : i))
    }
    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    const sync = (): void => {
      if (wide.matches) {
        track.dataset.pin = 'on'
        setPinned(true)
        // The spacer is the pinned frame's own height plus a beat per stage, so the section ends
        // when the ladder does rather than at an arbitrary multiple of the viewport.
        track.style.setProperty('--gl-frame', `${Math.round(pin.getBoundingClientRect().height)}px`)
      } else {
        delete track.dataset.pin
        track.style.removeProperty('--gl-frame')
        setPinned(false)
      }
      onScroll()
    }

    sync()
    ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null
    ro?.observe(pin)
    wide.addEventListener('change', sync)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      ro?.disconnect()
      cancelAnimationFrame(raf)
      wide.removeEventListener('change', sync)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', sync)
    }
  }, [stages.length])

  /**
   * Tapping a stage goes to that stage.
   *
   * It moves the SCROLL POSITION rather than setting state, because scroll is what drives the line —
   * setting state directly would be overwritten by the next scroll frame. One source of truth, so
   * tap, keyboard and scroll cannot disagree.
   *
   * `auto`, not `smooth`: inside the pinned range the section does not move on screen, only its
   * state does, so an instant seek reads as the line advancing rather than as the page lurching.
   */
  const pick = useCallback(
    (i: number) => {
      const track = trackRef.current
      if (!track || track.dataset.pin !== 'on') return
      const r = track.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      if (travel <= 0) return
      window.scrollTo({ top: r.top + window.scrollY + travel * ((i + 0.5) / stages.length), behavior: 'auto' })
    },
    [stages.length],
  )

  const fill = `${(active / last) * 100}%`

  return (
    <div
      ref={trackRef}
      className="gl-track"
      style={{ '--gl-step': `${STEP_VH}vh`, '--gl-steps': stages.length } as CSSProperties}
    >
      <div ref={pinRef} className="gl-pin">
        {head}

        <div className="gl-rail" role="group" aria-label="Career ladder">
          <div className="gl-line">
            <div className="gl-fill" style={{ width: fill }} />
            {/* Remounted on every change (keyed), which is what replays its one-shot travel. The
                signal runs the segment the line just gained: draw → travel → settle. */}
            <span key={active} className="gl-signal" style={{ left: fill }} aria-hidden />
          </div>

          <ol className="gl-steps">
            {stages.map((s, i) => (
              <li key={s.step || i}>
                <button
                  type="button"
                  className="gl-node"
                  data-on={i <= active ? '' : undefined}
                  data-active={i === active ? '' : undefined}
                  aria-current={i === active ? 'step' : undefined}
                  onClick={() => pick(i)}
                >
                  <span className="gl-dot" aria-hidden />
                  <span className="gl-name">{s.step}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="gl-stage">
          {stages.map((s, i) => (
            <div
              key={s.step || i}
              className="gl-panel"
              data-state={i === active ? 'in' : i < active ? 'past' : 'next'}
              aria-hidden={pinned && i !== active ? true : undefined}
            >
              {/* h3 — repeated items directly under the section's h2. */}
              <h3 className="gl-panel-title">{s.step}</h3>
              <p className="gl-panel-body">{s.body || note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
