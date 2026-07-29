import { ClosingField } from '@/components/about/AboutSystems'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { CtaBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * SCENE 08 — the close. An About-only treatment of the shared `ctaBlock`; Industries, Scales,
 * Solutions and Capabilities render the shared component unchanged (see RenderBlocks).
 *
 * The page comes back to where it started: the hero's grid returns, then collapses toward a
 * single horizon line as the statement settles. The statement itself is set at the hero's scale
 * so the two read as bookends. The CTA arrives only once the statement has landed, and picks up
 * a restrained magnetic pull on pointer devices.
 *
 * The CMS `backgroundImage` is not rendered here. It was a full-colour plate that broke the
 * black / warm-white / grey identity in the page's final frame; the field does that work now.
 * The field is untouched in the CMS.
 *
 * CONTENT: heading, description and both button labels come from the CMS unchanged.
 */
export function AboutEditorialCta({ heading, description, button_1, button_2 }: CtaBlock): JSX.Element {
  return (
    <section
      data-scene="closing"
      className="ax-bleed ax-scene relative isolate flex min-h-[84svh] flex-col justify-center overflow-hidden px-5 py-20 md:px-8 lg:min-h-[92svh] lg:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(110%_90%_at_50%_50%,#000_0%,rgba(0,0,0,0.35)_55%,transparent_88%)]"
      >
        <ClosingField />
      </div>

      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-12">
        {heading ? (
          <h2 className="ax-display ax-h max-w-[13ch] text-cream">
            <span data-ax="mask" className="block">
              {heading}
            </span>
          </h2>
        ) : null}

        <div data-ax="cta" className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          {description ? (
            <div className="ax-body max-w-[52ch]">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}

          <div className="flex w-full shrink-0 flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            {button_1?.label ? (
              <span data-ax="magnetic" className="inline-block">
                <Link
                  href={(button_1?.link as string) || '#'}
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-line bg-button-dark px-6 font-display text-base text-cream transition-colors duration-200 hover:bg-button-dark/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
                >
                  {button_1.label}
                </Link>
              </span>
            ) : null}
            {button_2?.label ? (
              <span data-ax="magnetic" className="inline-block">
                <Link
                  href={(button_2?.link as string) || '#'}
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-cream px-6 font-display text-base text-ink transition-colors duration-200 hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
                >
                  {button_2.label}
                </Link>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutEditorialCta
