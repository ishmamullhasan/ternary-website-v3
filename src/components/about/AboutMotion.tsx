'use client'

import { useEffect, useRef, type ElementType, type JSX, type ReactNode } from 'react'
import './aboutMotion.css'

/**
 * Drives the About page's editorial motion: what has been revealed, how far each parallax
 * layer has travelled, and which numeral in a sticky rail is live.
 *
 * It owns STATE only — one attribute, three classes and one custom property. Every duration,
 * easing and distance lives in aboutMotion.css.
 *
 * `data-am="on"` is set here, from JavaScript, and only when the visitor has not asked for
 * reduced motion. Until it is set the stylesheet has no hiding rules to apply, so the markup
 * renders finished. That is deliberate and it is the whole design: the site's shared <Motion>
 * wrapper writes `initial: { opacity: 0 }` into the server HTML, which is why the current
 * About page ships 64 elements at inline opacity:0 and reads blank with JavaScript disabled.
 * Nothing here can regress that way, because the hidden state is only ever added by the same
 * JavaScript that is guaranteed to remove it.
 *
 * Reveals use IntersectionObserver and fire once — an element that has been read does not
 * un-reveal when scrolled back past. Parallax and the counter need continuous position rather
 * than a threshold crossing, so they read getBoundingClientRect on a rAF-throttled scroll.
 */
export default function AboutMotion({
  children,
  className = '',
  tag: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  tag?: ElementType
}): JSX.Element {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // From here on the stylesheet's hiding rules apply. Everything below is responsible for
    // taking them back off again.
    root.dataset.am = 'on'

    // ── reveals ──────────────────────────────────────────────────────────────
    const targets = [...root.querySelectorAll<HTMLElement>('.am-r, .am-mask, .am-rule, .am-zoom')]
    // Tracks what has not been revealed yet, so the resize pass below knows what to re-check.
    const pending = new Set(targets)

    const reveal = (el: HTMLElement): void => {
      el.classList.add('is-in')
      pending.delete(el)
      io.unobserve(el)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement)
        }
      },
      // A little inset at the bottom so items commit once they are properly on screen rather
      // than the instant a single pixel clears the fold.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    )
    targets.forEach((t) => io.observe(t))

    // Reveal anything that currently has a box on screen. Covers two cases:
    //
    //  1. Above the fold at mount — it must not wait for a scroll that may never come.
    //  2. Responsive swaps. A target inside a `lg:hidden` / `hidden lg:block` pair is
    //     display:none at one breakpoint, so it has no box, never intersects, and never
    //     reveals. Cross the breakpoint and it gets a box — but IntersectionObserver was
    //     measured not to deliver an entry for it, leaving it stranded at opacity 0 for the
    //     rest of the session. Rotating a tablet was enough to lose the plate on this page.
    const revealInView = (): void => {
      for (const t of [...pending]) {
        const r = t.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) continue // still display:none
        if (r.top < window.innerHeight && r.bottom > 0) reveal(t)
      }
    }

    const settle = requestAnimationFrame(revealInView)

    // ── parallax + counter ───────────────────────────────────────────────────
    const layers = [...root.querySelectorAll<HTMLElement>('.am-par')]
    const nums = [...root.querySelectorAll<HTMLElement>('.am-num')]
    const steps = [...root.querySelectorAll<HTMLElement>('.am-step')]

    let raf = 0
    let live = -1

    const apply = (): void => {
      raf = 0
      const vh = window.innerHeight

      for (const layer of layers) {
        const r = layer.getBoundingClientRect()
        // -1 when the element sits a full viewport below the fold, +1 when a full viewport
        // above it, 0 as it passes the middle. Clamped so off-screen layers park rather than
        // running away.
        const centre = r.top + r.height / 2
        const p = Math.max(-1, Math.min(1, (vh / 2 - centre) / (vh / 2 + r.height / 2)))
        layer.style.setProperty('--am-p', p.toFixed(4))
      }

      if (steps.length && nums.length) {
        // The live step is the last one whose top has crossed the reading line (45% down the
        // viewport). Before any has, nothing is live.
        const line = vh * 0.45
        let next = -1
        steps.forEach((s, i) => {
          if (s.getBoundingClientRect().top <= line) next = i
        })
        if (next !== live) {
          live = next
          nums.forEach((n, i) => {
            n.classList.toggle('is-live', i === live)
            n.classList.toggle('is-past', i < live)
          })
        }
      }
    }

    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    // Resize is always listened for, even in a block with no parallax layer or counter, because
    // the reveal re-check above depends on it to catch breakpoint swaps.
    const onResize = (): void => {
      revealInView()
      onScroll()
    }

    const needsPosition = layers.length > 0 || steps.length > 0
    if (needsPosition) {
      apply()
      window.addEventListener('scroll', onScroll, { passive: true })
    }
    window.addEventListener('resize', onResize)

    return () => {
      io.disconnect()
      cancelAnimationFrame(settle)
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <Tag ref={ref} className={`am ${className}`}>
      {children}
    </Tag>
  )
}
