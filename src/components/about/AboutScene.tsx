'use client'

import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useEffect, useRef, type ElementType, type JSX, type ReactNode } from 'react'
import './aboutScene.css'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin)

const EASE = 'power3.out'

/**
 * The About page's motion engine.
 *
 * WHY THIS REPLACED THE FIRST ATTEMPT. The first version worked — verified on the deploy with
 * data-am set, stylesheet loaded, elements resolving, zero console errors — and still read as a
 * static page, because an 18px rise over 0.72s firing once is below the threshold at which a
 * reader registers movement at all. The failure was amplitude, not wiring. This version is
 * scroll-LINKED rather than scroll-triggered: most of what moves here is tied to scroll
 * position, so motion continues as long as the reader does, instead of completing before their
 * eye arrives.
 *
 * HOW IT IS DRIVEN. Blocks stay server components and declare intent in markup via `data-anim`;
 * this client component is the only place animation code lives. That keeps the page server
 * rendered, keeps one file to reason about, and means a block never has to become a client
 * island to move.
 *
 * THE SSR CONTRACT IS UNCHANGED AND LOAD-BEARING. Nothing is hidden in CSS or in the markup.
 * Every start state is written by gsap.from() when its trigger is built, so the server HTML
 * contains the finished page. The current live About page ships 64 elements at inline
 * opacity:0 and is blank without JavaScript; that class of failure cannot occur here.
 *
 * GATING. gsap.matchMedia owns the breakpoints: full scenes with pinning on desktop, shorter
 * travel and no pins on mobile, and nothing at all under reduced motion — which covers both the
 * OS setting and the site's own A11yFab toggle (`html[data-a11y-motion='reduce']`), since that
 * toggle would otherwise force transition-duration to 0.01ms while GSAP kept animating.
 */
export default function AboutScene({
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

    const prefersReduce =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-a11y-motion') === 'reduce'
    if (prefersReduce) return

    const q = <T extends Element = HTMLElement>(sel: string): T[] => [...root.querySelectorAll<T>(sel)]
    const splits: SplitText[] = []

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // ── shared: works at every size, distances scale ────────────────────────
      mm.add(
        {
          desktop: '(min-width: 1024px)',
          mobile: '(max-width: 1023px)',
        },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean; mobile: boolean }
          const RISE = desktop ? 56 : 26
          const SHIFT = desktop ? 60 : 24

          // Masked headline reveal. SplitText does the clipping (`mask: 'lines'`), so the type
          // genuinely rises out of its own line box rather than fading in place.
          for (const el of q('[data-anim="mask"]')) {
            const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line-mask' })
            splits.push(split)
            gsap.from(split.lines, {
              yPercent: 118,
              duration: desktop ? 1.05 : 0.85,
              ease: 'power4.out',
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: 'top 90%' },
            })
          }

          // Same, but consecutive lines arrive from opposite sides — the thesis headline.
          for (const el of q('[data-anim="mask-dir"]')) {
            const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line-mask' })
            splits.push(split)
            gsap.from(split.lines, {
              yPercent: 100,
              xPercent: (i: number) => (i % 2 === 0 ? -32 : 32),
              opacity: 0,
              duration: 1.1,
              ease: 'power4.out',
              stagger: 0.11,
              scrollTrigger: { trigger: el, start: 'top 90%' },
            })
          }

          // The workhorse reveal, now at a distance you can actually see.
          for (const el of q('[data-anim="rise"]')) {
            gsap.from(el, {
              opacity: 0,
              y: RISE,
              duration: 0.95,
              ease: EASE,
              scrollTrigger: { trigger: el, start: 'top 88%' },
            })
          }

          // Groups arrive in sequence rather than together.
          for (const group of q('[data-anim-group]')) {
            const kids = [...group.querySelectorAll<HTMLElement>('[data-anim-item]')]
            if (!kids.length) continue
            gsap.from(kids, {
              opacity: 0,
              y: RISE,
              duration: 0.9,
              ease: EASE,
              stagger: desktop ? 0.11 : 0.07,
              scrollTrigger: { trigger: group, start: 'top 85%' },
            })
          }

          // Alternating entry direction down a column — the culture list.
          for (const [i, el] of q('[data-anim="alt"]').entries()) {
            gsap.from(el, {
              opacity: 0,
              x: desktop ? (i % 2 === 0 ? -SHIFT : SHIFT) : 0,
              y: desktop ? 24 : RISE,
              duration: 1,
              ease: EASE,
              scrollTrigger: { trigger: el, start: 'top 86%' },
            })
          }

          // Editorial rules draw themselves in.
          for (const el of q('[data-anim="rule"]')) {
            gsap.from(el, {
              scaleX: 0,
              transformOrigin: 'left center',
              duration: 1.1,
              ease: 'power3.inOut',
              scrollTrigger: { trigger: el, start: 'top 94%' },
            })
          }

          // Words picked out of a line, arriving after it.
          for (const group of q('[data-anim="keywords"]')) {
            const words = [...group.querySelectorAll<HTMLElement>('[data-keyword]')]
            if (!words.length) continue
            gsap.from(words, {
              opacity: 0,
              yPercent: 100,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.08,
              scrollTrigger: { trigger: group, start: 'top 88%' },
            })
          }

          // ── scroll-LINKED layers (these keep moving while you do) ───────────
          for (const el of q('[data-anim="parallax"]')) {
            const amt = Number(el.dataset.amt ?? 12)
            gsap.fromTo(
              el,
              { yPercent: -amt },
              {
                yPercent: amt,
                ease: 'none',
                scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
              },
            )
          }

          // The hero headline drifts up and settles back slightly as the page leaves it.
          for (const el of q('[data-anim="hero-scrub"]')) {
            gsap.to(el, {
              yPercent: desktop ? -18 : -10,
              scale: desktop ? 0.94 : 0.97,
              opacity: 0.55,
              transformOrigin: 'left top',
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top top+=80', end: '+=520', scrub: 0.6 },
            })
          }

          // Oversized echo of the section's own heading, moving against the column beside it.
          // Existing copy, aria-hidden — a typographic device, not new content.
          for (const el of q('[data-anim="bgword"]')) {
            gsap.fromTo(
              el,
              { yPercent: 8, xPercent: -3 },
              {
                yPercent: -14,
                xPercent: 3,
                ease: 'none',
                scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
              },
            )
          }

          // Index numerals ride the scroll and grow as their entry becomes current.
          for (const el of q('[data-anim="num"]')) {
            gsap.fromTo(
              el,
              { yPercent: 60, opacity: 0.25 },
              {
                yPercent: -60,
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: el.closest('[data-anim-step]') ?? el,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.5,
                },
              },
            )
          }

          // ── technical grid ──────────────────────────────────────────────────
          for (const svg of q<SVGSVGElement>('[data-anim="grid"]')) {
            const lines = [...svg.querySelectorAll('line')]
            if (!lines.length) continue
            gsap.from(lines, {
              drawSVG: '0%',
              duration: 1.6,
              ease: 'power2.inOut',
              stagger: { each: 0.045, from: 'random' },
              scrollTrigger: { trigger: svg, start: 'top 92%' },
            })
            gsap.to(svg, {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: svg, start: 'top bottom', end: 'bottom top', scrub: true },
            })
          }

          // ── node diagram: edges draw on scroll, nodes breathe, signals travel ─
          for (const svg of q<SVGSVGElement>('[data-anim="diagram"]')) {
            const edges = [...svg.querySelectorAll<SVGPathElement>('.asc-edge')]
            const nodes = [...svg.querySelectorAll<SVGCircleElement>('.asc-node')]
            const rings = [...svg.querySelectorAll<SVGCircleElement>('.asc-node-ring')]
            const signals = [...svg.querySelectorAll<SVGCircleElement>('.asc-signal')]

            // TRIGGER OFF THE SECTION, NOT THE SVG. The diagram lives in a `position: sticky`
            // rail, and a sticky element's box stops travelling with the scroll once it pins —
            // so ScrollTrigger resolved this as already complete and the edges were fully drawn
            // at every scroll position (measured: stroke-dashoffset 0 throughout). The section
            // is in normal flow, so its progress is the real reading progress, and the wires
            // now draw across the whole time the reader spends in the section.
            const scope = svg.closest('section') ?? svg

            if (edges.length) {
              gsap.from(edges, {
                drawSVG: '0%',
                ease: 'none',
                stagger: 0.12,
                scrollTrigger: { trigger: scope, start: 'top 72%', end: 'bottom 85%', scrub: 0.7 },
              })
            }
            if (nodes.length) {
              gsap.from(nodes, {
                scale: 0,
                transformOrigin: 'center',
                duration: 0.7,
                ease: 'back.out(2)',
                stagger: 0.09,
                scrollTrigger: { trigger: scope, start: 'top 80%' },
              })
              // A slow breath, offset per node so the cluster never pulses in unison.
              nodes.forEach((n, i) => {
                gsap.to(n, {
                  scale: 1.5,
                  transformOrigin: 'center',
                  duration: 1.9,
                  ease: 'sine.inOut',
                  repeat: -1,
                  yoyo: true,
                  delay: i * 0.28,
                })
              })
            }
            if (rings.length) {
              rings.forEach((r, i) => {
                gsap.fromTo(
                  r,
                  { scale: 0.6, opacity: 0.9, transformOrigin: 'center' },
                  { scale: 2.4, opacity: 0, duration: 2.6, ease: 'power2.out', repeat: -1, delay: i * 0.6 },
                )
              })
            }
            // Signals run the wires. Each is pinned to its own edge via data-path.
            signals.forEach((s, i) => {
              const path = svg.querySelector<SVGPathElement>(`#${s.dataset.path ?? ''}`)
              if (!path) return
              gsap.to(s, {
                motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
                duration: 2.4,
                ease: 'none',
                repeat: -1,
                delay: i * 0.8,
              })
              gsap.fromTo(
                s,
                { opacity: 0 },
                { opacity: 1, duration: 0.4, repeat: -1, yoyo: true, repeatDelay: 1.6, delay: i * 0.8 },
              )
            })
          }

          // ── active-state emphasis down a list ───────────────────────────────
          for (const list of q('[data-anim="live-list"]')) {
            const items = [...list.querySelectorAll<HTMLElement>('.asc-item')]
            if (!items.length) return
            list.setAttribute('data-live', 'on')
            items.forEach((item) => {
              ScrollTrigger.create({
                trigger: item,
                start: 'top 62%',
                end: 'bottom 42%',
                onToggle: (self) => item.classList.toggle('is-live', self.isActive),
              })
            })
          }
        },
      )

      // ── desktop-only: the pinned scene ────────────────────────────────────────
      mm.add('(min-width: 1024px)', () => {
        for (const scene of q('[data-anim="scene"]')) {
          const slides = [...scene.querySelectorAll<HTMLElement>('.asc-slide')]
          const plate = scene.querySelector<HTMLElement>('.asc-scene-plate')
          const dots = [...scene.querySelectorAll<HTMLElement>('.asc-dot')]
          if (slides.length < 2) continue

          scene.setAttribute('data-scene', 'on')

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: scene,
              start: 'top top',
              // A beat per slide, a little over half a viewport each — five full-height holds
              // reads as a scroll trap rather than as pacing.
              end: () => `+=${slides.length * window.innerHeight * 0.62}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })

          gsap.set(slides.slice(1), { opacity: 0, yPercent: 6 })
          dots[0]?.classList.add('is-on')

          slides.forEach((slide, i) => {
            if (i === 0) return
            // SEQUENTIAL, NOT SIMULTANEOUS. Running both halves of the crossfade off one label
            // left the outgoing and incoming practice both legible at once — two headlines and
            // two paragraphs stacked on the same pixels, which is unreadable and looked broken.
            // The outgoing slide now clears before the incoming one arrives, with a sliver of
            // overlap so the cut still feels continuous rather than blank.
            tl.to(slides[i - 1], { opacity: 0, yPercent: -5, duration: 0.4, ease: 'power2.in' })
              .to(slide, { opacity: 1, yPercent: 0, duration: 0.5, ease: 'power2.out' }, '>-0.08')
              // The plate keeps turning through the scene so it reads as one continuous shot
              // rather than five separate cards.
              .to(plate, { scale: 1 + i * 0.028, rotate: i * 0.45, duration: 0.9, ease: 'power2.inOut' }, '<')
              .add(() => {
                dots.forEach((d, n) => d.classList.toggle('is-on', n === i))
              }, '<')
              // A beat to read on before the next hand-over.
              .to({}, { duration: 0.55 })
          })
        }

        // Restrained magnetic pull on the closing buttons. Pointer devices only.
        const magnets = q<HTMLElement>('[data-anim="magnetic"]')
        const cleanups: (() => void)[] = []
        if (window.matchMedia('(hover: hover)').matches) {
          for (const el of magnets) {
            const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
            const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
            const move = (e: PointerEvent): void => {
              const r = el.getBoundingClientRect()
              // Capped at 8px: enough to feel alive under the cursor, not enough to make the
              // button feel like it is dodging the click.
              xTo(gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) * 0.28))
              yTo(gsap.utils.clamp(-8, 8, (e.clientY - (r.top + r.height / 2)) * 0.28))
            }
            const reset = (): void => {
              xTo(0)
              yTo(0)
            }
            el.addEventListener('pointermove', move)
            el.addEventListener('pointerleave', reset)
            cleanups.push(() => {
              el.removeEventListener('pointermove', move)
              el.removeEventListener('pointerleave', reset)
            })
          }
        }
        return () => cleanups.forEach((fn) => fn())
      })
    }, root)

    // ScrollTrigger measures on build. Fonts change line boxes (and SplitText's line count),
    // and the CMS images arrive later still — both move every start/end below them. Refresh
    // once each has settled, or the triggers further down the page fire at the wrong scroll
    // position.
    const refresh = (): void => ScrollTrigger.refresh()
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready.then(refresh).catch(() => {})
    const imgs = [...root.querySelectorAll('img')].filter((i) => !i.complete)
    let pending = imgs.length
    if (pending) {
      const done = (): void => {
        if (--pending <= 0) refresh()
      }
      imgs.forEach((i) => {
        i.addEventListener('load', done, { once: true })
        i.addEventListener('error', done, { once: true })
      })
    }
    const t = window.setTimeout(refresh, 900)

    return () => {
      window.clearTimeout(t)
      splits.forEach((s) => s.revert())
      ctx.revert()
    }
  }, [])

  return (
    <Tag ref={ref} className={`asc ${className}`}>
      {children}
    </Tag>
  )
}
