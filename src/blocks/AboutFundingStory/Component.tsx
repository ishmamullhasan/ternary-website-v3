import Motion from '@/components/animation/motion'
import type { AboutFundingStoryBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Closing CTA band — "The horizon is agentic." (design node 1266:13345). The signature noise-grain
 * device: a rich violet→indigo radial gradient under the local `/noise.svg` grain and a legibility
 * scrim, with centered display copy. Renders entirely from CSS so it looks identical whether or not
 * CMS media is present; an optional `backgroundImage` is layered (grayscale) beneath the gradient
 * when available, replacing the previous external stock-photo fallback.
 */
export function AboutFundingStoryComponent({
  heading,
  description,
  backgroundImage,
}: AboutFundingStoryBlock): JSX.Element | null {
  const bgUrl = (backgroundImage as Media | undefined)?.url ?? undefined

  if (!heading && !description) return null

  return (
    <Motion
      tag="section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative isolate flex min-h-[300px] items-center justify-center overflow-hidden rounded-md lg:min-h-[340px]"
    >
      {/* Optional CMS photo, desaturated, beneath the gradient. */}
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img aria-hidden src={bgUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover grayscale" />
      ) : null}
      {/* Brand grain gradient (violet → indigo). */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(120% 120% at 22% 18%, #6d4bd1 0%, #3a2a8c 46%, #1a1b4b 100%)',
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[url('/noise.svg')] bg-[length:260px] opacity-[0.18] mix-blend-overlay"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/15 via-transparent to-black/45" />

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-16 text-center lg:py-20">
        {heading ? (
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream text-balance">
            {heading}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-cream/80 lg:text-base">{description}</p>
        ) : null}
      </div>
    </Motion>
  )
}
