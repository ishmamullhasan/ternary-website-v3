'use client'

import { useEffect, useRef, type JSX, type ReactNode } from 'react'
import './solutionScene.css'

/**
 * Drives the scroll choreography for one solution card.
 *
 * The component owns only STATE — two classes and a custom property. Every
 * duration, delay and easing lives in solutionScene.css, so the sequence can be
 * retimed without touching JavaScript:
 *
 *   enter        → `is-in`   : card rises, figure draws, copy staggers in
 *   handover     → `is-out`  : figure unwinds as the NEXT card takes the frame
 *   scroll       → `--par`   : a few px of parallax on the figure
 *
 * `data-anim="on"` is set here rather than in the markup, and only when the
 * visitor has not asked for reduced motion. That is what makes the CSS safe:
 * without this attribute every rule collapses to the finished state, so a card
 * is fully readable before hydration, with JS disabled, or under reduced
 * motion. Nothing on this page is visible only because an animation ran.
 */
export default function SolutionScene({
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

    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!motionOk) return // leave the base rules — the finished card — alone
    el.dataset.anim = 'on'

    // ── enter ───────────────────────────────────────────────────────────────
    // once: a card that re-runs its build every time it scrolls past reads as
    // a glitch, not as choreography.
    const enter = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in')
          el.classList.remove('is-out')
          enter.disconnect()
        }
      },
      { threshold: 0.18 },
    )
    enter.observe(el)

    // ── handover ────────────────────────────────────────────────────────────
    // Watch the NEXT card, not this one. When it has climbed to ~35% of the
    // viewport this figure begins to unwind — and because the next card's own
    // enter threshold (18%) is crossed earlier, it has already started drawing.
    // The two overlap by design.
    // `.sc` sits inside the Section's padding div, so the next card is the sibling of
    // the enclosing <section> — not of this element's own parent.
    const next = el.closest('section')?.nextElementSibling?.querySelector<HTMLElement>('.sc')
    let handover: IntersectionObserver | undefined
    if (next) {
      handover = new IntersectionObserver(
        ([e]) => el.classList.toggle('is-out', e.isIntersecting && el.classList.contains('is-in')),
        // top of the next card past 35% up the viewport
        { rootMargin: '0px 0px -35% 0px', threshold: 0 },
      )
      handover.observe(next)
    }

    // ── parallax ────────────────────────────────────────────────────────────
    // Written straight to the element as a custom property, coalesced to one
    // write per frame: scroll fires far more often than the compositor can use,
    // and this must never trigger a React render.
    let raf = 0
    const onScroll = (): void => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        // -1 (card leaving the top) → 1 (card still below the fold)
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight
        el.style.setProperty('--par', `${(Math.max(-1, Math.min(1, p)) * 14).toFixed(1)}px`)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      enter.disconnect()
      handover?.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={ref} className={`sc ${className ?? ''}`}>
      {children}
    </div>
  )
}
