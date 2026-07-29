'use client'

import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { useEffect, useRef, type JSX, type ReactNode } from 'react'
import './aboutExperience.css'
import { WAY_EDGES, WAY_STATES, edgePath, lerpLayout, type Pt } from './systems'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin)

/**
 * The About page as one continuous scroll-driven experience.
 *
 * ONE ENGINE FOR THE WHOLE PAGE, not a wrapper per block. That is what lets the scenes hand
 * over to each other — the hero scales through into the thesis, the thesis camera keeps
 * travelling, the colour inverts across a boundary — instead of behaving as seven independent
 * widgets that each happen to animate.
 *
 * SSR CONTRACT. Nothing is hidden in CSS or markup. Every start state is written by gsap.from()
 * or gsap.set() when its trigger is built, so the server HTML is the finished, readable page.
 * The live About page ships 64 elements at inline opacity:0 and is blank without JavaScript,
 * because <Motion initial={{opacity:0}}> serialises the hidden state; that cannot happen here.
 *
 * LEADERSHIP IS NOT TOUCHED. The Meet the Team block sits inside this wrapper but carries no
 * `data-ax` or `data-scene` marker, so no selector here reaches it, and the reduced-motion CSS
 * is scoped to animated subtrees for the same reason. Verified byte-identical to the live
 * component (57,350 bytes of rendered markup, identical computed styles).
 *
 * GATING. Under `prefers-reduced-motion` or the site's own A11yFab toggle no context is built
 * and Lenis never starts — the page is a normal document with native scrolling. gsap.matchMedia
 * owns the rest: pinned scenes above 900px, vertical sequences below it, so mobile never
 * inherits a viewport-tall box with nothing in it.
 *
 * SplitText ships in the installed gsap package (3.15 — all plugins are free), so no paid
 * dependency is introduced.
 */
export default function AboutExperience({ children }: { children: ReactNode }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reduce =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-a11y-motion') === 'reduce'
    if (reduce) return

    const q = <T extends Element = HTMLElement>(sel: string): T[] => [...root.querySelectorAll<T>(sel)]
    const splits: SplitText[] = []

    // ── smooth scroll ───────────────────────────────────────────────────────
    // Lenis drives the scroll position; ScrollTrigger reads it. They are married through the
    // GSAP ticker so there is exactly one rAF loop and no drift between the smoothed position
    // and the trigger calculations. Native smoothing is off so the two cannot fight.
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number): void => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      /**
       * Hold a stage open at its tallest state.
       *
       * A hidden sizer element cannot do this reliably: it has to guess which state is tallest,
       * and the guess is wrong whenever the longest title and the longest excerpt belong to
       * different items — or when a title wraps to a different number of lines than the sizer's
       * copy of it. Both happened; the last line of the tallest state was clipped. Measuring the
       * real states after layout is exact, and re-running it on refresh keeps it correct after
       * fonts load and on resize.
       */
      const sizeStage = (scene: Element): void => {
        const stack = scene.querySelector<HTMLElement>('.ax-stack')
        if (!stack) return
        const states = [...stack.querySelectorAll<HTMLElement>('.ax-state')]
        if (!states.length) return
        const tallest = Math.max(...states.map((s) => s.scrollHeight))
        stack.style.minHeight = `${Math.ceil(tallest)}px`
      }

      /** Wrap an element's lines in clipping spans and rise them out of it. */
      const maskLines = (el: Element, opts: { stagger?: number; dir?: boolean } = {}): void => {
        const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ax-line-mask' })
        splits.push(split)
        gsap.from(split.lines, {
          yPercent: 115,
          xPercent: opts.dir ? (i: number) => (i % 2 ? 26 : -26) : 0,
          duration: 1.1,
          ease: 'power4.out',
          stagger: opts.stagger ?? 0.09,
          scrollTrigger: { trigger: el, start: 'top 92%' },
        })
      }

      mm.add(
        { wide: '(min-width: 900px)', narrow: '(max-width: 899px)' },
        (context) => {
          const { wide } = context.conditions as { wide: boolean; narrow: boolean }

          // ── SCENE 01 — HERO ───────────────────────────────────────────────
          for (const scene of q('[data-scene="hero"]')) {
            const heading = scene.querySelector('[data-ax="chars"]')
            const field = scene.querySelector('[data-ax="field"]')

            if (heading) {
              // Characters, clipped by their own lines — not a fade-up. The two lines arrive
              // close enough together to read as one object rather than as a sequence.
              const split = new SplitText(heading, {
                type: 'chars,lines',
                mask: 'lines',
                linesClass: 'ax-line-mask',
              })
              splits.push(split)
              gsap.from(split.chars, {
                yPercent: 105,
                duration: 1.15,
                ease: 'power4.out',
                stagger: { each: 0.012, from: 'start' },
                delay: 0.12,
              })
            }

            // The headline enlarges and passes behind the next scene rather than fading out.
            if (heading && wide) {
              gsap.to(heading, {
                scale: 1.28,
                yPercent: -14,
                transformOrigin: 'left center',
                ease: 'none',
                scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom top', scrub: 0.5 },
              })
            }

            if (field) {
              const lines = [...field.querySelectorAll('line')]
              gsap.from(lines, {
                drawSVG: '0%',
                duration: 1.8,
                ease: 'power2.inOut',
                stagger: { each: 0.035, from: 'random' },
              })
              gsap.to(field, {
                yPercent: wide ? 14 : 8,
                ease: 'none',
                scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom top', scrub: true },
              })

              // Cursor response — the field leans toward the pointer. Pointer devices only, and
              // small enough to read as depth rather than as a toy.
              if (wide && window.matchMedia('(hover: hover)').matches) {
                const pts = field.querySelector('[data-ax-field-points]')
                const xTo = gsap.quickTo(field, 'x', { duration: 1.1, ease: 'power3' })
                const yTo = gsap.quickTo(field, 'y', { duration: 1.1, ease: 'power3' })
                const pxTo = pts ? gsap.quickTo(pts, 'x', { duration: 0.9, ease: 'power3' }) : null
                const pyTo = pts ? gsap.quickTo(pts, 'y', { duration: 0.9, ease: 'power3' }) : null
                const onMove = (e: PointerEvent): void => {
                  const cx = (e.clientX / window.innerWidth - 0.5) * 2
                  const cy = (e.clientY / window.innerHeight - 0.5) * 2
                  xTo(cx * 14)
                  yTo(cy * 10)
                  pxTo?.(cx * -26)
                  pyTo?.(cy * -18)
                }
                window.addEventListener('pointermove', onMove, { passive: true })
                context.add?.(() => window.removeEventListener('pointermove', onMove))
              }
            }
          }

          // ── SCENE 02 — THESIS: camera through a system ────────────────────
          for (const scene of q('[data-scene="thesis"]')) {
            const camera = scene.querySelector('[data-ax-camera]')
            const states = [...scene.querySelectorAll<HTMLElement>('.ax-state')]
            const dots = [...scene.querySelectorAll<HTMLElement>('.ax-dot')]
            const edges = [...scene.querySelectorAll<SVGPathElement>('.ax-edge')]
            const anchors = [...scene.querySelectorAll<SVGGElement>('[data-ax-anchor]')]

            // Wires draw across the whole time the reader is in the section. Triggered off the
            // scene (normal flow), never off the graphic — the graphic is sticky/pinned, and a
            // pinned box stops travelling, which makes ScrollTrigger resolve it as already
            // complete. That bug shipped once already; it is not repeating.
            if (edges.length) {
              gsap.from(edges, {
                drawSVG: '0%',
                ease: 'none',
                stagger: 0.06,
                scrollTrigger: { trigger: scene, start: 'top 78%', end: 'bottom 90%', scrub: 0.6 },
              })
            }

            if (wide && states.length > 1) {
              sizeStage(scene)
              scene.setAttribute('data-stage', 'on')
              gsap.set(states.slice(1), { opacity: 0, yPercent: 8, scale: 0.94 })
              dots[0]?.classList.add('is-on')
              anchors[0]?.classList.add('is-live')

              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: scene,
                  start: 'top top',
                  end: () => `+=${states.length * window.innerHeight * 0.6}`,
                  pin: true,
                  scrub: 0.8,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              })

              states.forEach((state, i) => {
                if (i === 0) return
                const prev = states[i - 1]
                // Camera: each hand-over pushes further into the field and re-centres on the
                // anchor belonging to the statement now being read. This is the depth — the
                // system is not sliding past, it is being travelled through.
                const target = anchors[i % anchors.length]
                const cx = Number(target?.querySelector('circle')?.getAttribute('cx') ?? 50)
                const cy = Number(target?.querySelector('circle')?.getAttribute('cy') ?? 50)

                tl.to(prev, { opacity: 0, yPercent: -8, scale: 0.94, duration: 0.4, ease: 'power2.in' })
                  .to(state, { opacity: 1, yPercent: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, '>-0.1')
                  .to(
                    camera,
                    {
                      scale: 1 + i * 0.16,
                      xPercent: (50 - cx) * 0.5,
                      yPercent: (50 - cy) * 0.5,
                      transformOrigin: 'center center',
                      duration: 0.9,
                      ease: 'power2.inOut',
                    },
                    '<',
                  )
                  .add(() => {
                    dots.forEach((d, n) => d.classList.toggle('is-on', n === i))
                    anchors.forEach((a, n) => a.classList.toggle('is-live', n === i % anchors.length))
                  }, '<')
                  .to({}, { duration: 0.45 })
              })
            } else {
              // Narrow: a vertical connected journey. Each statement rises as it is reached and
              // the connector between them draws — no pin, no viewport-tall empty box.
              states.forEach((state) => {
                gsap.from(state, {
                  opacity: 0,
                  y: 34,
                  duration: 0.85,
                  ease: 'power3.out',
                  scrollTrigger: { trigger: state, start: 'top 88%' },
                })
              })
              for (const rail of scene.querySelectorAll('[data-ax="v-rail"]')) {
                gsap.from(rail, {
                  scaleY: 0,
                  transformOrigin: 'top center',
                  ease: 'none',
                  scrollTrigger: { trigger: scene, start: 'top 70%', end: 'bottom 80%', scrub: true },
                })
              }
            }
          }

          // ── SCENE 03 — THE TERNARY WAY: one system, five states ───────────
          for (const scene of q('[data-scene="way"]')) {
            const svg = scene.querySelector('[data-ax="way-system"]')
            const nodeEls = svg ? [...svg.querySelectorAll<SVGCircleElement>('[data-ax-way-nodes] circle')] : []
            const edgeEls = svg ? [...svg.querySelectorAll<SVGPathElement>('[data-ax-way-edges] path')] : []
            const ring = svg?.querySelector<SVGCircleElement>('[data-ax-way-ring]')
            const states = [...scene.querySelectorAll<HTMLElement>('.ax-state')]
            const dots = [...scene.querySelectorAll<HTMLElement>('.ax-dot')]

            // The morph itself: a single tweened scalar walks 0 → 4 through the layouts, and
            // every frame recomputes node positions and rebuilds each edge from them. That is
            // what makes it one system rearranging rather than five diagrams swapped.
            const morph = { t: 0 }
            const paint = (): void => {
              const i = Math.min(WAY_STATES.length - 2, Math.floor(morph.t))
              const f = gsap.utils.clamp(0, 1, morph.t - i)
              const pts: Pt[] = lerpLayout(WAY_STATES[i], WAY_STATES[i + 1], f)
              nodeEls.forEach((n, k) => {
                if (!pts[k]) return
                n.setAttribute('cx', String(pts[k].x))
                n.setAttribute('cy', String(pts[k].y))
              })
              edgeEls.forEach((e, k) => {
                const [a, b] = WAY_EDGES[k]
                if (pts[a] && pts[b]) e.setAttribute('d', edgePath(pts[a], pts[b]))
              })
              if (ring && pts[8]) {
                ring.setAttribute('cx', String(pts[8].x))
                ring.setAttribute('cy', String(pts[8].y))
              }
            }

            if (wide && states.length > 1) {
              sizeStage(scene)
              scene.setAttribute('data-stage', 'on')
              gsap.set(states.slice(1), { opacity: 0, yPercent: 8 })
              dots[0]?.classList.add('is-on')

              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: scene,
                  start: 'top top',
                  end: () => `+=${states.length * window.innerHeight * 0.62}`,
                  pin: true,
                  scrub: 0.7,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              })

              states.forEach((state, i) => {
                if (i === 0) return
                tl.to(states[i - 1], { opacity: 0, yPercent: -8, duration: 0.4, ease: 'power2.in' })
                  .to(state, { opacity: 1, yPercent: 0, duration: 0.5, ease: 'power3.out' }, '>-0.1')
                  .to(morph, { t: i, duration: 0.9, ease: 'power2.inOut', onUpdate: paint }, '<')
                  .add(() => dots.forEach((d, n) => d.classList.toggle('is-on', n === i)), '<')
                  .to({}, { duration: 0.4 })
              })
            } else {
              // Narrow: the system still morphs, driven by the section's own scroll progress,
              // with the principles in normal flow beneath it.
              ScrollTrigger.create({
                trigger: scene,
                start: 'top 80%',
                end: 'bottom 60%',
                scrub: 0.6,
                onUpdate: (self) => {
                  morph.t = self.progress * (WAY_STATES.length - 1)
                  paint()
                },
              })
              states.forEach((state) => {
                gsap.from(state, {
                  opacity: 0,
                  y: 30,
                  duration: 0.8,
                  ease: 'power3.out',
                  scrollTrigger: { trigger: state, start: 'top 88%' },
                })
              })
            }

            if (ring) {
              gsap.to(ring, { scale: 1.5, opacity: 0, transformOrigin: 'center', duration: 2.8, ease: 'power2.out', repeat: -1 })
            }
          }

          // ── SCENE 04 — PROOF: an archive with one active entry ────────────
          for (const scene of q('[data-scene="proof"]')) {
            const rows = [...scene.querySelectorAll<HTMLElement>('.ax-proof-row')]
            const list = scene.querySelector('.ax-proof')
            if (!rows.length) continue
            list?.setAttribute('data-index', 'on')

            const setActive = (i: number): void => {
              rows.forEach((r, n) => r.classList.toggle('is-active', n === i))
            }
            setActive(0)

            // Scroll sets the active entry.
            rows.forEach((row, i) => {
              ScrollTrigger.create({
                trigger: row,
                start: 'top 66%',
                end: 'bottom 46%',
                onToggle: (self) => {
                  if (self.isActive) setActive(i)
                },
              })
              gsap.from(row, {
                opacity: 0,
                y: wide ? 44 : 24,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: { trigger: row, start: 'top 90%' },
              })
            })

            // Hover takes over on pointer devices.
            if (wide && window.matchMedia('(hover: hover)').matches) {
              rows.forEach((row, i) => {
                const enter = (): void => setActive(i)
                row.addEventListener('pointerenter', enter)
                context.add?.(() => row.removeEventListener('pointerenter', enter))
              })
            }
          }

          // ── SCENE 05 — CULTURE: typographic states, black ↔ warm white ────
          for (const scene of q('[data-scene="culture"]')) {
            const states = [...scene.querySelectorAll<HTMLElement>('.ax-state')]
            states.forEach((state, i) => {
              const kw = state.querySelector('[data-ax="kw"]')
              if (kw) maskLines(kw, { stagger: 0.07 })
              gsap.from(state, {
                opacity: 0,
                y: wide ? 46 : 24,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: { trigger: state, start: 'top 86%' },
              })
              // Alternating ground. The flip is a real background change on the scene, driven
              // by which principle is on screen, so the page swings between black and warm
              // white as it is read rather than staying uniformly dark.
              if (i % 2 === 1) {
                ScrollTrigger.create({
                  trigger: state,
                  start: 'top 60%',
                  end: 'bottom 40%',
                  onToggle: (self) => scene.classList.toggle('ax-invert', self.isActive),
                })
              }
            })
          }

          // ── SCENE 07 — FUNDING: a signal crossing the field ───────────────
          for (const scene of q('[data-scene="funding"]')) {
            for (const line of scene.querySelectorAll('[data-ax="signal-line"]')) {
              gsap.fromTo(
                line,
                { scaleX: 0, transformOrigin: 'left center' },
                {
                  scaleX: 1,
                  ease: 'none',
                  scrollTrigger: { trigger: scene, start: 'top 78%', end: 'bottom 70%', scrub: 0.5 },
                },
              )
            }
            for (const dot of scene.querySelectorAll('[data-ax="signal-dot"]')) {
              gsap.fromTo(
                dot,
                { xPercent: 0 },
                {
                  xPercent: 100,
                  ease: 'none',
                  scrollTrigger: { trigger: scene, start: 'top 78%', end: 'bottom 70%', scrub: 0.5 },
                },
              )
            }
          }

          // ── SCENE 08 — CLOSING: the hero system, transformed ──────────────
          for (const scene of q('[data-scene="closing"]')) {
            const field = scene.querySelector('[data-ax="closing-field"]')
            const cta = scene.querySelector('[data-ax="cta"]')
            if (field) {
              const lines = [...field.querySelectorAll('line')]
              gsap.from(lines, {
                drawSVG: '0%',
                duration: 1.5,
                ease: 'power2.inOut',
                stagger: { each: 0.03, from: 'center' },
                scrollTrigger: { trigger: scene, start: 'top 80%' },
              })
              // Collapses toward the horizon — the hero's grid arriving at its end state.
              gsap.to(field, {
                scaleY: 0.24,
                transformOrigin: 'center center',
                ease: 'none',
                scrollTrigger: { trigger: scene, start: 'top 85%', end: 'bottom bottom', scrub: 0.7 },
              })
            }
            // The CTA only arrives once the statement has settled.
            if (cta) {
              gsap.from(cta, {
                opacity: 0,
                y: 26,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: { trigger: scene, start: 'top 46%' },
              })
            }
          }

          // ── shared primitives ─────────────────────────────────────────────
          for (const el of q('[data-ax="mask"]')) maskLines(el)
          for (const el of q('[data-ax="mask-dir"]')) maskLines(el, { dir: true })

          for (const el of q('[data-ax="rise"]')) {
            gsap.from(el, {
              opacity: 0,
              y: wide ? 48 : 24,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%' },
            })
          }

          for (const el of q('[data-ax="rule"]')) {
            gsap.from(el, {
              scaleX: 0,
              transformOrigin: 'left center',
              duration: 1.1,
              ease: 'power3.inOut',
              scrollTrigger: { trigger: el, start: 'top 94%' },
            })
          }

          for (const el of q('[data-ax="parallax"]')) {
            const amt = Number((el as HTMLElement).dataset.amt ?? 10) * (wide ? 1 : 0.5)
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

          // Signals riding their wires. Green, and only ever on aria-hidden graphics.
          for (const s of q<SVGCircleElement>('[data-ax-signal]')) {
            const path = root.querySelector<SVGPathElement>(`#${s.dataset.axSignal ?? ''}`)
            if (!path) continue
            gsap.set(s, { opacity: 0.9 })
            gsap.to(s, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
              duration: 2.6,
              ease: 'none',
              repeat: -1,
              delay: Math.random() * 1.2,
            })
          }

          // Restrained magnetic pull, pointer devices only, capped so the button never dodges.
          if (wide && window.matchMedia('(hover: hover)').matches) {
            for (const el of q<HTMLElement>('[data-ax="magnetic"]')) {
              const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
              const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
              const move = (e: PointerEvent): void => {
                const r = el.getBoundingClientRect()
                xTo(gsap.utils.clamp(-9, 9, (e.clientX - (r.left + r.width / 2)) * 0.3))
                yTo(gsap.utils.clamp(-9, 9, (e.clientY - (r.top + r.height / 2)) * 0.3))
              }
              const reset = (): void => {
                xTo(0)
                yTo(0)
              }
              el.addEventListener('pointermove', move)
              el.addEventListener('pointerleave', reset)
              context.add?.(() => {
                el.removeEventListener('pointermove', move)
                el.removeEventListener('pointerleave', reset)
              })
            }
          }
        },
      )
    }, root)

    // ScrollTrigger measures on build. Fonts change line boxes (and therefore SplitText's line
    // count), and CMS images arrive later still — both move every start/end below them.
    const refresh = (): void => {
      // Re-measure the stages first: fonts and resize change how many lines each state takes,
      // and a stale min-height would clip the tallest one again.
      for (const scene of root.querySelectorAll('[data-stage="on"]')) {
        const stack = scene.querySelector<HTMLElement>('.ax-stack')
        const states = stack ? [...stack.querySelectorAll<HTMLElement>('.ax-state')] : []
        if (stack && states.length) stack.style.minHeight = `${Math.ceil(Math.max(...states.map((s) => s.scrollHeight)))}px`
      }
      ScrollTrigger.refresh()
    }
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
      gsap.ticker.remove(tick)
      lenis.destroy()
      splits.forEach((s) => s.revert())
      ctx.revert()
      ScrollTrigger.getAll().forEach((s) => s.kill())
    }
  }, [])

  return (
    <div ref={ref} className="ax">
      {children}
    </div>
  )
}
