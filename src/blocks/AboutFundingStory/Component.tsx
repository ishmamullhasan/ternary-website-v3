import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutFundingStoryBlock } from '@/payload-types'
import Link from 'next/link'
import type { JSX } from 'react'

/**
 * SCENE 07 — independence, as an editorial statement rather than a rectangular banner.
 *
 * WHITE ground. The CMS `backgroundImage` — a full-colour uploaded plate — is deliberately not
 * rendered: it broke the black / warm-white identity, and it needed a scrim nobody could tune,
 * because media serving returns 500 outside production and the plate has never once been visible
 * in any environment available for review.
 *
 * What carries the section instead is type and one line: a large black headline, a single rule
 * drawn across the full measure as the section is scrolled, and one small green marker running
 * it. The line is the argument — held straight over distance.
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
      className="ax-white ax-scene relative isolate w-full overflow-hidden px-5 py-28 md:px-10 lg:px-16 lg:py-40"
    >
      <span aria-hidden data-ax="wipe" data-wipe="word" className="ax-wipe ax-wipe-white" />
      <div className="ax-above mx-auto flex w-full max-w-[1400px] flex-col gap-10">
        {eyebrow ? (
          <span data-ax="rise" className="ax-label">
            {eyebrow}
          </span>
        ) : null}

        {heading ? (
          <h2 className="ax-hx ax-h max-w-[12ch]">
            <span data-ax="mask" className="block">
              {heading}
            </span>
          </h2>
        ) : null}

        {/* The signal: one line drawn across the full measure with a single black marker running
            it — held, straight, over distance. */}
        <div aria-hidden className="relative h-px w-full">
          <span data-ax="signal-line" className="ax-hair absolute inset-0 block" />
          <span
            data-ax="signal-dot"
            className="absolute top-1/2 left-0 block h-1.5 w-1.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: '#090909' }}
          />
        </div>

        {description ? (
          <div data-ax="rise" className="ax-copy">
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
                        ? 'inline-flex h-11 items-center justify-center rounded-lg border border-[rgba(9,9,9,0.2)] px-5 font-display text-base font-normal text-[#090909] transition-colors duration-200 hover:bg-[rgba(9,9,9,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#090909] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1efe8]'
                        : 'inline-flex h-11 items-center justify-center rounded-lg bg-[#090909] px-5 font-display text-base font-normal text-[#f1efe8] transition-colors duration-200 hover:bg-[#242424] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#090909] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1efe8]'
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
