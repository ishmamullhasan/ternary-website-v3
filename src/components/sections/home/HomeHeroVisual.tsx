'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useEffect, useRef, type JSX } from 'react'
import './homeHero.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * The home hero's structure, animated as a 2.5D object.
 *
 * The asset is used exactly as supplied (`/images/ternary-hero-structure.png`, 1448×1086) and its
 * proportions are never altered: `object-contain` against the intrinsic ratio, so it letterboxes
 * inside its frame rather than stretching, and it is never cropped into a vertical composition.
 * Served through next/image so it ships as WebP/AVIF at the size actually needed — the source PNG
 * is 1.85 MB and would otherwise sit on the LCP path. The file itself is untouched.
 *
 * The layering is what reads as 2.5D rather than a moving picture: an outer stage takes cursor
 * parallax, a floating layer drifts and rotates, a breathing layer scales, and a light sweep
 * passes across inside the same mask. Each lives on its own element so no two animations fight
 * for the same transform.
 *
 * Rotation is capped at ±1.5deg and every duration is measured in seconds, not milliseconds —
 * this is meant to read as weather, not as a spin.
 *
 * The image renders with no motion state of its own, so with JavaScript off or under reduced
 * motion the hero is simply a still composition rather than an empty frame.
 */
export default function HomeHeroVisual(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reduce =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-a11y-motion') === 'reduce'
    if (reduce) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add({ wide: '(min-width: 1024px)', narrow: '(max-width: 1023px)' }, (context) => {
        const { wide } = context.conditions as { wide: boolean; narrow: boolean }
        const float = root.querySelector<HTMLElement>('.hh-float')
        const breathe = root.querySelector<HTMLElement>('.hh-breathe')
        const frame = root.querySelector<HTMLElement>('.hh-frame')
        const sweep = root.querySelector<HTMLElement>('.hh-sweep')
        const dots = [...root.querySelectorAll<SVGCircleElement>('.hh-dot')]

        // Settles in rather than being there before the statement.
        gsap.from(frame, { opacity: 0, scale: 1.06, duration: 2, ease: 'power2.out' })
        gsap.from(dots, { opacity: 0, duration: 1.6, ease: 'power2.out', stagger: 0.12, delay: 0.5 })

        if (float) {
          // Slow vertical float and a subtle left-to-right drift, on separate tweens with
          // different periods so the object never returns to the same place on a visible cycle.
          gsap.to(float, {
            yPercent: wide ? 2.6 : 1.6,
            duration: 12,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
          gsap.to(float, {
            xPercent: wide ? 1.8 : 1,
            duration: 17,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
          // Gentle rotation, capped well inside ±1.5deg.
          gsap.fromTo(
            float,
            { rotation: -1.2 },
            { rotation: 1.2, duration: 23, ease: 'sine.inOut', repeat: -1, yoyo: true },
          )
        }

        // Scale breathing. Deliberately small — a 1448px lattice starts to shimmer at its edges
        // if it is scaled much further than this.
        if (breathe) {
          gsap.to(breathe, { scale: 1.04, duration: 9.5, ease: 'sine.inOut', repeat: -1, yoyo: true })
        }

        // The light sweep. A long pause between passes so it reads as an event rather than a loop.
        if (sweep) {
          gsap.fromTo(
            sweep,
            { xPercent: -130 },
            { xPercent: 130, duration: 4.8, ease: 'power1.inOut', repeat: -1, repeatDelay: 5.5 },
          )
        }

        // Restrained particle drift, and only around the visual.
        dots.forEach((d, i) => {
          gsap.to(d, {
            attr: { cy: `+=${i % 2 ? 2.6 : -2.6}` },
            duration: 10 + i * 1.6,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        })

        // Cursor parallax, desktop pointers only. The object and the particles move at different
        // depths — that difference is what sells the composition as dimensional.
        if (wide && window.matchMedia('(hover: hover)').matches) {
          const dotLayer = root.querySelector<SVGGElement>('.hh-dot-layer')
          const fx = gsap.quickTo(frame, 'x', { duration: 1.4, ease: 'power3' })
          const fy = gsap.quickTo(frame, 'y', { duration: 1.4, ease: 'power3' })
          const dx = dotLayer ? gsap.quickTo(dotLayer, 'x', { duration: 1, ease: 'power3' }) : null
          const dy = dotLayer ? gsap.quickTo(dotLayer, 'y', { duration: 1, ease: 'power3' }) : null
          const onMove = (e: PointerEvent): void => {
            const cx = e.clientX / window.innerWidth - 0.5
            const cy = e.clientY / window.innerHeight - 0.5
            fx(cx * 24)
            fy(cy * 16)
            dx?.(cx * -40)
            dy?.(cy * -26)
          }
          window.addEventListener('pointermove', onMove, { passive: true })
          context.add?.(() => window.removeEventListener('pointermove', onMove))
        }
      })
    }, root)

    // Fonts change the copy's height above the visual, which moves this element.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    return () => ctx.revert()
  }, [])

  // Points sit with the visual and never over the copy — the frame is its own grid row.
  const dots = [
    { x: 9, y: 24 },
    { x: 27, y: 71 },
    { x: 52, y: 15 },
    { x: 74, y: 66 },
    { x: 91, y: 33 },
  ]

  return (
    <div ref={ref} className="hh-visual">
      <div className="hh-stage">
        <div className="hh-float">
          <div className="hh-breathe">
            <div className="hh-frame">
              <Image
                src="/images/ternary-hero-structure.png"
                alt=""
                width={1448}
                height={1086}
                priority
                sizes="(max-width: 1023px) 128vw, 1480px"
                className="hh-img"
              />
              <span aria-hidden className="hh-sweep" />
            </div>
          </div>
        </div>
      </div>

      <svg aria-hidden className="hh-dots" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <g className="hh-dot-layer">
          {dots.map((d, i) => (
            <circle key={i} className="hh-dot" cx={d.x} cy={d.y} r="0.32" fill="#f2f0ea" opacity="0.55" />
          ))}
        </g>
      </svg>
    </div>
  )
}
