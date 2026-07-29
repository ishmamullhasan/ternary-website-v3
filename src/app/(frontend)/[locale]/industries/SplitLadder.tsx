'use client'

import Heading from '@/components/a11y/Heading'
import Reveal from '@/components/hub/Reveal'
import { useEffect, useRef, useState, type JSX } from 'react'

/** One rung of the ladder, plus the editorial summary the preview panel shows while it is active. */
export type LadderItem = {
  k: string
  title: string
  body: string
  preview: {
    /** One-word framing, set large. */
    keyword: string
    /** Two lines at panel width. */
    line: string
    /** Three labels; each restates something already in `body`. */
    chips: readonly string[]
  }
}

/**
 * "Our approach" / "Regulatory posture" — a split section whose left column carries the section's
 * claim and a preview panel for whichever rung is currently active.
 *
 * The left column used to be a heading and then nothing: the lead is short, the ladder beside it is
 * three tall tiles, and the resulting hole ran most of the section's height. Rather than fill it
 * with a fourth card — which would read as more of the same list — the empty area became the part
 * of the section that responds. The panel is a summary, not a copy of the tile: a keyword, a line,
 * and three labels.
 *
 * ACTIVE COMES FROM TWO PLACES. Pointer wins while it is over the ladder; otherwise the rung
 * nearest the viewport's middle is active, so the panel keeps up on a scroll and on touch, where
 * there is no hover at all. Both write the same state, so the panel never disagrees with the tile
 * highlighted beside it.
 *
 * Pointer and focus are both delegated from the ladder rather than bound per tile: `Reveal` takes no
 * event props, and wrapping each rung to add them would put a div between the grid and its `.step`
 * children. Focus is handled as well as hover — the rungs hold no interactive elements today, so
 * nothing can receive it yet, but the moment one gains a link the panel follows the keyboard for
 * free instead of answering only to a mouse.
 *
 * The panel is `aria-hidden`. It is a visual echo of the tile next to it — the keyword restates the
 * title, the chips restate the body — so nothing here is only available to sighted users. Exposing
 * it would instead announce a summary that changes as the page scrolls, which is hostile. The rungs
 * themselves are plain headings and paragraphs, in order, and carry the actual content.
 */
export default function SplitLadder({
  eyebrow,
  heading,
  items,
  flow = false,
}: {
  eyebrow: string
  heading: string
  items: readonly LadderItem[]
  /** `true` for a sequence (directional wash), `false` for guarantees that stand equally. */
  flow?: boolean
}): JSX.Element {
  const [pointed, setPointed] = useState<number | null>(null)
  const [nearest, setNearest] = useState(0)
  const ladderRef = useRef<HTMLDivElement>(null)

  /** Resolve an event target to the rung containing it, and make that rung active. */
  const point = (target: EventTarget | null): void => {
    const root = ladderRef.current
    const step = target instanceof Element ? target.closest('.step') : null
    if (!root || !step) return
    const i = [...root.querySelectorAll('.step')].indexOf(step)
    if (i >= 0) setPointed(i)
  }

  useEffect(() => {
    const root = ladderRef.current
    if (!root) return

    let raf = 0
    const apply = (): void => {
      raf = 0
      const steps = [...root.querySelectorAll<HTMLElement>('.step')]
      if (!steps.length) return
      const middle = window.innerHeight / 2
      let best = 0
      let bestDistance = Infinity
      steps.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - middle)
        if (d < bestDistance) {
          bestDistance = d
          best = i
        }
      })
      setNearest((prev) => (prev === best ? prev : best))
    }

    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const active = pointed ?? nearest

  return (
    <div className="wrap split">
      <Reveal x>
        <span className="eyebrow">{eyebrow}</span>
        <Heading level={2} className="split-lead">
          {heading}
        </Heading>

        {/* Every summary is rendered and stacked in one grid cell, so the panel sizes to the
            tallest of them and never resizes as the active one changes. Without JavaScript the
            first stays on, which is a sensible resting state rather than an empty box. */}
        <div className="prev" aria-hidden>
          <div className="prev-body">
            {items.map((item, i) => (
              <div key={item.k} className={`prev-item ${i === active ? 'is-on' : i < active ? 'is-past' : 'is-next'}`}>
                <p className="prev-key">{item.preview.keyword}</p>
                <p className="prev-line">{item.preview.line}</p>
                <ul className="prev-chips">
                  {item.preview.chips.map((chip) => (
                    <li key={chip}>{chip}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div
        ref={ladderRef}
        className={`ladder ${flow ? 'ladder-flow' : 'ladder-stack'}`}
        onMouseOver={(e) => point(e.target)}
        onMouseLeave={() => setPointed(null)}
        onFocus={(e) => point(e.target)}
        onBlur={() => setPointed(null)}
      >
        {items.map((step, i) => (
          <Reveal className={`step${i === active ? ' is-active' : ''}`} i={i} key={step.k}>
            <div>
              <Heading level={3}>{step.title}</Heading>
              <p>{step.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
