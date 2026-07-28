'use client'

import { useEffect, useRef, type CSSProperties, type JSX } from 'react'
import './revealText.css'

export interface RevealSegment {
  text: string
  /** Optional class for this run of words — e.g. a second tone within one sentence. */
  className?: string
}

/**
 * A statement that arrives word by word as it comes into view: the words sit dim, then
 * light up left to right, finishing on their own.
 *
 * WHY THIS AND NOT A SCROLL-SCRUBBED REVEAL. The fashionable version of this effect maps
 * word opacity to scroll position, so the sentence brightens only as far as you have
 * scrolled. It looks good in a demo and behaves badly in a page: stop scrolling halfway
 * and half the sentence stays unreadable, and a reader who lands mid-page or uses
 * keyboard paging can be left with permanently dim text. This is triggered by entry and
 * then completes regardless — the same gesture, without holding the words hostage to the
 * scroll position. CSS `animation-timeline: view()` would do the scrubbed version with no
 * JS, but it is Chromium-only today, so it would also need this path as a fallback.
 *
 * The component owns only state: one attribute and one class. Timing lives in
 * revealText.css. `data-rv="on"` is set here, from JS, and only when reduced motion is
 * off — which is what lets the stylesheet keep the finished sentence as its base rule.
 */
export default function RevealText({
  segments,
  className,
  as: Tag = 'p',
}: {
  segments: RevealSegment[]
  className?: string
  as?: 'p' | 'h2' | 'div'
}): JSX.Element {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.dataset.rv = 'on'

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        el.classList.add('is-in')
        io.disconnect() // once — a sentence that re-dims on every pass reads as a fault
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // One continuous counter across segments, so the stagger runs through the whole
  // sentence rather than restarting at each change of tone.
  let w = 0

  return (
    <Tag ref={ref as never} className={`rv ${className ?? ''}`}>
      {segments.map((seg, si) => (
        <span key={si} className={seg.className}>
          {si > 0 ? ' ' : null}
          {seg.text.split(' ').map((word, i) => (
            <span key={i} className="rv-w" style={{ '--w': w++ } as CSSProperties}>
              {i > 0 ? ' ' : null}
              {word}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
