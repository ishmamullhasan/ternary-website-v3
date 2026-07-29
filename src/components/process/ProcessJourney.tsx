'use client'

import { useEffect, useRef, type JSX, type ReactNode } from 'react'
import './processJourney.css'

/**
 * Drives the "How we operate" journey: which principle is live, how far the rail has
 * filled, and which courses of the figure are built.
 *
 * It owns STATE only — one attribute, two classes and a custom property. Every duration
 * and easing lives in processJourney.css.
 *
 * `data-journey="on"` is set here, from JavaScript, and only when the visitor has not
 * asked for reduced motion. That is what makes the stylesheet safe: without the
 * attribute every rule collapses to the fully revealed state, so all five principles are
 * readable before hydration, with JS off, and under reduced motion. The site's shared
 * Motion wrapper strands elements on opacity 0 in exactly those cases; this is built the
 * opposite way round on purpose.
 *
 * The active step is chosen by proximity to a line ~42% up the viewport rather than by
 * raw intersection. With five short steps several are on screen at once, so "is it
 * visible" cannot pick one — "which is nearest the reading line" can, and it advances
 * smoothly instead of flickering between neighbours.
 */
export default function ProcessJourney({ count, children }: { count: number; children: ReactNode }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    root.dataset.journey = 'on'

    const steps = [...root.querySelectorAll<HTMLElement>('.pj-step')]
    const plates = [...root.querySelectorAll<HTMLElement>('.pj-plate')]
    const fill = root.querySelector<HTMLElement>('.pj-rail-fill')
    if (!steps.length) return

    let raf = 0
    let current = -1

    const apply = (): void => {
      raf = 0
      const line = window.innerHeight * 0.42
      let best = 0
      let bestDist = Infinity
      steps.forEach((s, i) => {
        const r = s.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - line)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      if (best === current) return
      current = best

      steps.forEach((s, i) => s.classList.toggle('is-on', i === best))
      plates.forEach((pl, i) => {
        pl.classList.toggle('is-live', i === best)
        pl.classList.toggle('is-built', i < best)
      })
      // +1 so the first principle already shows progress rather than an empty rail
      if (fill) fill.style.setProperty('--pj-progress', `${((best + 1) / count) * 100}%`)
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
    <div ref={ref} className="pj section-card">
      {children}
    </div>
  )
}
