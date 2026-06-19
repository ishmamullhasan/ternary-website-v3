import Motion from '@/components/animation/motion'
import type { CareersHeroBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

/**
 * Careers hero (design node 943:5379, elevated).
 *
 * A quiet two-column intro: a Poppins display headline + Inter description + a filled eggshell
 * "View Opportunities" CTA on the left, balanced by a tall full-height teal noise-gradient panel
 * on the right. The panel reuses the homepage hero's signature device — a radial-gradient TONE
 * with a local /noise.svg grain overlay and a bottom scrim — so it renders identically whether or
 * not the CMS media (S3) is available (image is layered on top and degrades to the gradient).
 *
 * Server component. Reveals use the shared <Motion> wrapper (honours prefers-reduced-motion and
 * fires once); the CTA hover/focus is pure Tailwind.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Teal→green field matching the design's header image, origin top-left so the brightest point
// reads as a light source the grain sits over.
const TEAL_FIELD = 'radial-gradient(125% 125% at 22% 16%, #2f9d8a 0%, #1b6f5b 42%, #0a2d28 100%)'

export function CareersHeroComponent(props: CareersHeroBlock): JSX.Element {
  const button = props.buttons?.[0]
  const headingLines = (props.heading || 'Agentic Engineering. Human Orchestration.')
    .split(/\.\s+/)
    .filter(Boolean)
    .map((line, i, arr) => (i < arr.length - 1 || (props.heading || '').trim().endsWith('.') ? `${line}.` : line))
  const mediaUrl = (props.image as Media)?.url || undefined

  return (
    <Motion
      tag="section"
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-[clamp(2rem,5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.04em] text-cream">
            {headingLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="max-w-[34rem] text-[15px] font-medium leading-[1.5] text-body lg:text-[16px]">
            {props.description ||
              'Build production systems you own end to end. We hire engineers who want technical depth, operational accountability, and real influence over what ships.'}
          </p>
        </div>
        <div>
          <a
            href={button?.url || '#open-roles'}
            className="inline-flex h-10 items-center justify-center rounded-md bg-cream px-4 text-[14px] font-semibold tracking-tight text-ink transition-colors duration-200 hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            {button?.label || 'View Opportunities'}
          </a>
        </div>
      </div>

      <Motion
        tag="div"
        className="relative aspect-[4/3] w-full overflow-hidden rounded-md ring-1 ring-white/5 lg:aspect-auto lg:h-[500px]"
        initial={{ opacity: 0, scale: 0.985 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        {/* Gradient field — the always-present base so the panel is never an empty/broken box. */}
        <span aria-hidden className="absolute inset-0" style={{ backgroundImage: TEAL_FIELD }} />
        {/* Optional CMS photo layered on top; if the S3 media is missing the gradient shows through. */}
        {mediaUrl && (
          <img
            src={mediaUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-luminosity"
          />
        )}
        {/* Signature grain overlay (local asset, no external dependency). */}
        <span
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
        />
        {/* Bottom scrim to ground the panel against the page. */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/40" />
      </Motion>
    </Motion>
  )
}
