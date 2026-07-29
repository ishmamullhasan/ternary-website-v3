import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutFundingStoryBlock } from '@/payload-types'
import Link from 'next/link'
import type { JSX } from 'react'

/**
 * SCENE 07 — independence, as an editorial statement rather than a rectangular banner.
 *
 * The CMS `backgroundImage` is deliberately not rendered any more. It was a full-colour uploaded
 * plate that pulled the page away from the black / warm-white / grey identity, and it needed a
 * heavy scrim to keep cream text legible over it — a scrim nobody has been able to tune, because
 * media serving returns 500 outside production and the plate has never once been visible in any
 * environment available for review. What replaces it speaks the page's own language: grain, a
 * horizontal signal line that draws across as the section is scrolled, and one green marker
 * travelling it. The field is the argument — a straight line held over distance.
 *
 * The CMS field itself is untouched, so nothing is lost if this is reverted.
 *
 * CONTENT: eyebrow, heading, description and button labels are the CMS strings, unchanged.
 */
export function AboutFundingStoryComponent({
  heading,
  description,
  eyebrow,
  links,
}: AboutFundingStoryBlock): JSX.Element | null {
  // Up to two CTA buttons, only those with both a label and a destination.
  const ctas = (links ?? []).filter((link) => link?.label && link?.url).slice(0, 2)

  if (!heading && !description) return null

  return (
    <section
      data-scene="funding"
      className="ax-bleed ax-scene ax-grain relative isolate overflow-hidden px-5 py-24 md:px-8 lg:px-12 lg:py-36"
    >
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10">
        {eyebrow ? (
          <span data-ax="rise" className="ax-meta">
            {eyebrow}
          </span>
        ) : null}

        {heading ? (
          <h2 className="ax-display-sm ax-h max-w-[14ch] text-cream">
            <span data-ax="mask" className="block">
              {heading}
            </span>
          </h2>
        ) : null}

        {/* The signal: one line drawn across the full measure with a single green marker running
            it — held, straight, over distance. The only green in the scene. */}
        <div aria-hidden className="relative h-px w-full">
          <span data-ax="signal-line" className="absolute inset-0 block h-px w-full bg-line-strong" />
          <span
            data-ax="signal-dot"
            className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: 'var(--ax-green)' }}
          />
        </div>

        {description ? (
          <div data-ax="rise" className="ax-body max-w-[56ch]">
            <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
          </div>
        ) : null}

        {ctas.length ? (
          <div data-ax="rise" className="flex flex-wrap items-center gap-3">
            {ctas.map((link, i) => {
              const isSecondary = link?.style === 'secondary'
              return (
                <span key={link?.id ?? i} data-ax="magnetic" className="inline-block">
                  <Link
                    href={link?.url ?? '#'}
                    className={
                      isSecondary
                        ? 'inline-flex h-11 items-center justify-center rounded-lg border border-line bg-button-dark px-5 font-display text-base font-normal text-cream transition-colors duration-200 hover:bg-button-dark/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink'
                        : 'inline-flex h-11 items-center justify-center rounded-lg bg-cream px-5 font-display text-base font-normal text-ink/90 transition-colors duration-200 hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink'
                    }
                  >
                    {link?.label}
                  </Link>
                </span>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
