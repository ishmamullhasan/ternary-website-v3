import AboutScene from '@/components/about/AboutScene'
import { AboutGrid } from '@/components/about/AboutGraphics'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { HeroBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * The About page's opening statement — an About-only treatment of the shared `hero` block.
 *
 * SCOPE: reached only when the page slug is `about` (see RenderBlocks). The six other pages
 * using `hero` render the shared centred component unchanged.
 *
 * MOTION: the sentence rises out of its own line boxes a line at a time; a technical grid draws
 * itself in behind and then drifts against the scroll; and the headline scales and lifts away as
 * the page moves past it, which is what hands the reader into the thesis rather than just
 * ending. All of it is driven by AboutScene — this file only marks intent.
 *
 * CONTENT: `heading` and `description` verbatim from the CMS. No word is added here.
 */
export function AboutEditorialHero({ heading, description }: HeroBlock): JSX.Element {
  return (
    <AboutScene tag="section" className="relative isolate w-full overflow-hidden pt-4 pb-2 lg:pt-6 lg:pb-10">
      {/* The ground the headline sits on. Masked toward the edges so it reads as a drawing that
          fades out, not as a boxed-in texture. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(120%_90%_at_25%_20%,#000_0%,rgba(0,0,0,0.35)_58%,transparent_86%)]"
      >
        <AboutGrid />
      </div>

      <div className="flex flex-col gap-10 lg:gap-14">
        {heading ? (
          // The page's single <h1>. `mask` splits it into lines and clips each one; `hero-scrub`
          // ties its scale and drift to scroll position.
          <h1
            data-anim="hero-scrub"
            className="font-display max-w-[19ch] text-[clamp(2.25rem,6.4vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.045em] text-cream text-balance"
          >
            <span data-anim="mask" className="block">
              {heading}
            </span>
          </h1>
        ) : null}

        <span aria-hidden data-anim="rule" className="h-px w-full bg-line-strong" />

        {description ? (
          <div data-anim="rise" className="max-w-[62ch] lg:ml-auto lg:w-[58%]">
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-[17px] prose-p:leading-[1.55] prose-p:tracking-[-0.01em] prose-p:text-body"
            />
          </div>
        ) : null}
      </div>
    </AboutScene>
  )
}

export default AboutEditorialHero
