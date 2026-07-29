import { HeroField } from '@/components/about/AboutSystems'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { HeroBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * SCENE 01 — the cinematic opening. An About-only treatment of the shared `hero` block; the six
 * other pages using `hero` render the shared centred component unchanged (see RenderBlocks).
 *
 * The statement holds the viewport at 11vw with 0.86 line-height and -0.06em tracking, so the
 * two lines read as one object rather than as two lines of a paragraph. Characters rise out of
 * their own clipped line boxes — not a fade-up. Behind it, a technical field draws itself in,
 * drifts against the scroll and leans toward the cursor. On scroll the headline enlarges and
 * travels up behind the thesis rather than fading away.
 *
 * CONTENT: `heading` and `description` verbatim from the CMS.
 */
export function AboutEditorialHero({ heading, description }: HeroBlock): JSX.Element {
  return (
    <section
      data-scene="hero"
      className="ax-bleed ax-scene relative isolate flex min-h-[86svh] flex-col justify-center overflow-hidden px-5 py-16 md:px-8 lg:min-h-[94svh] lg:px-12"
    >
      {/* The field. Masked toward the edges so it reads as a drawing that fades, not a boxed
          texture. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(120%_95%_at_30%_35%,#000_0%,rgba(0,0,0,0.4)_55%,transparent_88%)]"
      >
        <HeroField />
      </div>

      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 lg:gap-16">
        {heading ? (
          // The page's single <h1>.
          <h1 data-ax="chars" className="ax-display ax-h max-w-[15ch] text-cream">
            {heading}
          </h1>
        ) : null}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          <span aria-hidden data-ax="rule" className="ax-rule h-px w-full bg-line-strong lg:max-w-[34%]" />
          {description ? (
            <div data-ax="rise" className="ax-body max-w-[58ch]">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default AboutEditorialHero
