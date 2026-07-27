import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutFundingStoryBlock, Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import Link from 'next/link'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Closing CTA band (Figma 2387:2164) — "Agentic Engineering. Human Orchestration.". A full-bleed
 * background image sits under a flat black/20 scrim with centered display copy and a single
 * eggshell CTA. The CMS `backgroundImage` IS the design's visual (the violet→amber grain field is
 * an uploaded image, not a CSS gradient), so it renders at full colour on top of the scrim rather
 * than desaturated beneath a gradient. When no image is set we fall back to the brand grain
 * gradient so the band never renders bare.
 *
 * Cache-busting: the media `updatedAt` is appended as a query param via getMediaUrl. Media edits
 * bust every content tag (media.ts afterChange → bustAllTags), which regenerates this page's HTML;
 * the query param then forces the browser to refetch the replaced file instead of serving the
 * cached copy at the (unchanged) same-filename URL.
 */
export function AboutFundingStoryComponent({
  heading,
  description,
  eyebrow,
  links,
  backgroundImage,
}: AboutFundingStoryBlock): JSX.Element | null {
  const bg = backgroundImage as Media | undefined
  const bgUrl = bg?.url ? getMediaUrl(bg.url, bg.updatedAt) : undefined

  // Up to two CTA buttons, only those with both a label and a destination.
  const ctas = (links ?? []).filter((link) => link?.label && link?.url).slice(0, 2)

  if (!heading && !description) return null

  return (
    <Motion
      tag="section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative isolate flex flex-col items-center justify-center gap-6 overflow-hidden rounded-lg px-6 py-20 text-center lg:py-32"
    >
      {/* Background: the CMS image at full colour (Figma), or the brand grain gradient fallback. */}
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img aria-hidden src={bgUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: 'radial-gradient(120% 120% at 22% 18%, #6d4bd1 0%, #3a2a8c 46%, #1a1b4b 100%)',
          }}
        />
      )}
      {/* Flat legibility scrim (Figma: black @ 20%). */}
      <span aria-hidden className="absolute inset-0 -z-10 bg-black/20" />

      {/* Heading + description are a tight text block; the 24px section gap only separates it from
          the CTA below (Figma pairs the copy closer than it sits from the button). */}
      <div className="flex flex-col items-center">
        {eyebrow ? (
          <span className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-cream/70">
            {eyebrow}
          </span>
        ) : null}
        {heading ? (
          <h2 className="max-w-[1276px] font-display text-[clamp(1.75rem,4vw,40px)] font-medium leading-[1.15] text-balance text-cream">
            {heading}
          </h2>
        ) : null}
        {description ? (
          <RichTextComp
            content={description as RichText}
            className="max-w-[768px] opacity-90 prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-cream"
          />
        ) : null}
      </div>
      {ctas.length ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {ctas.map((link, i) => {
            const isSecondary = link?.style === 'secondary'
            return (
              <Link
                key={link?.id ?? i}
                href={link?.url ?? '#'}
                className={
                  isSecondary
                    ? 'inline-flex h-10 items-center justify-center rounded-lg border border-line bg-button-dark px-4 font-display text-base font-normal text-cream transition-colors duration-200 hover:bg-button-dark/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink'
                    : 'inline-flex h-10 items-center justify-center rounded-lg bg-cream px-4 font-display text-base font-normal text-ink/90 transition-colors duration-200 hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink'
                }
              >
                {link?.label}
              </Link>
            )
          })}
        </div>
      ) : null}
    </Motion>
  )
}
