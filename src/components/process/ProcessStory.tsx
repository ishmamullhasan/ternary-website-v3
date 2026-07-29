'use client'

import { useEffect, useRef, type CSSProperties, type JSX, type ReactNode } from 'react'
import './processStory.css'

/**
 * Drives the pinned "How we operate" stage: which principle is on, which have been read,
 * which plate of the figure is live, and which pagination dot is filled.
 *
 * It owns STATE only — one attribute and three classes. Durations and easing live in
 * processStory.css.
 *
 * `data-story="on"` is set here, from JavaScript, and only when the visitor has not asked
 * for reduced motion. Without it the stylesheet leaves every principle in normal flow and
 * fully readable, so the section degrades to a plain list rather than to four invisible
 * ones. The site's shared Motion wrapper fails exactly that way, which is why nothing
 * here depends on it.
 *
 * The active index comes from how far the section has travelled through its own pinned
 * range, not from IntersectionObserver: the slides are stacked in the same place, so they
 * all "intersect" identically and observation cannot tell them apart. Scroll progress can.
 */
export default function ProcessStory({ count, children }: { count: number; children: ReactNode }): JSX.Element {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    root.dataset.story = 'on'

    const slides = [...root.querySelectorAll<HTMLElement>('.ps-slide')]
    const dots = [...root.querySelectorAll<HTMLElement>('.ps-dot')]
    const plates = [...root.querySelectorAll<HTMLElement>('.ps-plate')]
    if (!slides.length) return

    let raf = 0
    let current = -1

    const apply = (): void => {
      raf = 0
      const r = root.getBoundingClientRect()
      // 0 when the pin engages, 1 when it releases
      const travel = r.height - window.innerHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0
      // nudge off the very end so the last principle holds instead of flickering at p===1
      const i = Math.min(count - 1, Math.floor(p * count * 0.999))
      if (i === current) return
      current = i

      slides.forEach((s, n) => {
        s.classList.toggle('is-on', n === i)
        s.classList.toggle('is-past', n < i)
      })
      dots.forEach((d, n) => d.classList.toggle('is-on', n === i))
      plates.forEach((pl, n) => {
        pl.classList.toggle('is-live', n === i)
        pl.classList.toggle('is-built', n < i)
      })
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
  }, [count])

  return (
    <section ref={ref} className="ps section-card w-full" style={{ '--ps-steps': count } as CSSProperties}>
      {children}
    </section>
  )
}
