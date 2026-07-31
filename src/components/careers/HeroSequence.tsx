'use client'

import { useEffect, useRef, type JSX, type ReactNode } from 'react'
import './careersHero.css'

/**
 * Sets `data-seq="on"` on the careers hero once, after mount, and does nothing else.
 *
 * All timing, state and reduced-motion handling live in careersHero.css. This component exists
 * only to answer one question — "is JavaScript running?" — because that is what lets the
 * stylesheet keep the FINISHED hero as its base rule: without JS the attribute is never set, the
 * animation rules never match, and the path is drawn and the headline set. The alternative, a
 * component that writes an inline `opacity: 0` and clears it later, is the exact bug the
 * `motion/react` wrapper has elsewhere in this block.
 *
 * Reduced motion is deliberately NOT checked here. The stylesheet honours both the OS media query
 * and the in-app A11yFab toggle, and the toggle can change after mount — a preference read once at
 * mount time would go stale. Checking here as well would only add a second source of truth.
 *
 * `children` is server-rendered and passed straight through, so wrapping the hero in this does not
 * pull the headline or the figure into the client bundle.
 */
export default function HeroSequence({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.dataset.seq = 'on'
    el.dataset.live = 'on'

    /* The signal loops for as long as the page is open, and `stroke-dashoffset` is not a
       compositable property — every frame of it repaints the figure. Measured at 44fps scrolling
       against a 60fps control with the loop disabled, which is a real cost to pay while the
       visitor is reading a part of the page the figure is not even on.

       So it runs only while the hero is on screen. PAUSED rather than removed: pausing freezes the
       cycle where it stopped and resumes it there, which keeps the signal and the annotation
       flashes — separate animations sharing one 5s clock — in step with each other. Tearing the
       animations off and re-adding them would restart both and replay the 2.6s lead-in every time
       the hero came back into view. */
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.live = entry?.isIntersecting ? 'on' : 'off'
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
