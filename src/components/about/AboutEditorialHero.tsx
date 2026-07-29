import { HeroAtmosphere, HeroPoints } from '@/components/about/AboutSystems'
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
 * The background is an abstract monochrome atmosphere — large soft forms that drift and reshape,
 * with the small white points kept from the previous treatment. The ruled grid and the divider
 * line are gone: they read as a wireframe behind the type. On scroll the lower bloom expands,
 * carrying the eye into the white thesis section rather than stopping and handing over.
 *
 * CONTENT: `heading` and `description` verbatim from the CMS.
 */
export function AboutEditorialHero({ heading, description }: HeroBlock): JSX.Element {
  return (
    <section
      data-scene="hero"
      className="ax-black ax-scene relative isolate flex min-h-[100svh] w-full flex-col justify-center overflow-hidden px-5 py-16 md:px-10 lg:px-16"
    >
      {/* The atmosphere: soft monochrome forms drifting behind the statement. No mask needed —
          the forms are already soft-edged and weighted away from the centre, so the copy sits on
          dark ground. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <HeroAtmosphere />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <HeroPoints />
      </div>

      <div className="ax-above mx-auto flex w-full max-w-[1400px] flex-col gap-8 lg:gap-10">
        {heading ? (
          // The page's single <h1>.
          <h1 data-ax="chars" className="ax-hx ax-h max-w-[13ch]">
            {heading}
          </h1>
        ) : null}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-end lg:gap-20">
          {description ? (
            <div data-ax="rise" className="ax-copy">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default AboutEditorialHero
