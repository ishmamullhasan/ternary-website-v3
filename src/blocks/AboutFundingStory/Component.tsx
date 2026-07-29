import AboutScene from '@/components/about/AboutScene'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutFundingStoryBlock, Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import Link from 'next/link'
import type { JSX } from 'react'

/**
 * "Bootstrapped and profitable" — the closing statement band.
 *
 * KEPT: the CMS `backgroundImage` is the design's actual visual (an uploaded grain field, not a
 * CSS gradient), so it still renders at full colour, and the media `updatedAt` cache-bust via
 * getMediaUrl is unchanged — media edits must still force a refetch of the same-filename URL.
 *
 * CHANGED: the copy was centred in the band; it is now ranged left against the image with the
 * statement masked in, and the plate drifts against the scroll. The band is the last thing
 * before the CTA, so it reads as a closing line rather than as a second, competing CTA.
 *
 * LEGIBILITY: the previous flat `black/20` was thin cover for cream text over a full-colour
 * photograph — the ratio depended entirely on which part of the image landed behind the words.
 * It is now a directional scrim, heaviest under the copy and clearing toward the opposite edge,
 * so the type has a guaranteed floor without flattening the image.
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
    <AboutScene
      tag="section"
      className="relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-md px-6 py-14 md:px-10 lg:min-h-[520px] lg:px-14 lg:py-20"
    >
      {/* The plate. Inset vertically beyond the frame so it has room to travel without
          exposing an edge as it drifts. */}
      <span aria-hidden className="absolute inset-x-0 -inset-y-[12%] -z-10 overflow-hidden">
        <span data-anim="parallax" data-amt="10" className="block h-full w-full">
          {bgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bgUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              className="block h-full w-full"
              style={{
                backgroundImage: 'radial-gradient(120% 120% at 22% 18%, #6d4bd1 0%, #3a2a8c 46%, #1a1b4b 100%)',
              }}
            />
          )}
        </span>
      </span>

      {/* Directional scrim: heavy under the copy, clearing to the right so the image is still
          an image.

          NOT VERIFIED AGAINST THE REAL PLATE. Local media serving returns 500 without S3
          credentials, so every check of this band was made over the gradient fallback — the
          uploaded grain field only appears on the review deploy. The weighting is therefore set
          to be safe rather than tuned: at 88% the composited backdrop is at most 12% of the
          image, which keeps cream text far above its floor whatever the pixels underneath are
          doing. Worth a look on the review URL, and worth loosening if it flattens the plate. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-page/88 via-page/60 to-page/15"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-page/80 via-transparent to-transparent" />

      <div className="flex max-w-[62ch] flex-col items-start gap-5">
        {eyebrow ? (
          <span data-anim="rise" className="font-mono text-xs font-medium tracking-[0.18em] text-cream uppercase">{eyebrow}</span>
        ) : null}

        {heading ? (
          <h2 className="font-display text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-medium tracking-[-0.04em] text-cream text-balance">
            <span data-anim="mask" className="block">
              {heading}
            </span>
          </h2>
        ) : null}

        {description ? (
          <div data-anim="rise" className="max-w-[56ch]">
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-cream"
            />
          </div>
        ) : null}

        {ctas.length ? (
          <div data-anim="rise" className="mt-2 flex flex-wrap items-center gap-3">
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
      </div>
    </AboutScene>
  )
}
