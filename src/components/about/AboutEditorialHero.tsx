import AboutHeroVisual from '@/components/about/AboutHeroVisual'
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
 * The background is the uploaded Ternary structure, animated as a 2.5D object: it floats,
 * drifts, breathes, rotates within ±1.2°, takes a light sweep and leans to the cursor, with
 * restrained particles around it. It sits in the lower band of the hero so it never crosses the
 * headline or the paragraph. No grid, no divider rule. On scroll the lower bloom expands,
 * carrying the eye into the white thesis section rather than stopping and handing over.
 *
 * CONTENT: `heading` and `description` verbatim from the CMS.
 */
export function AboutEditorialHero({ heading, description }: HeroBlock): JSX.Element {
  return (
    <section
      data-scene="hero"
      className="ax-black ax-scene relative isolate grid min-h-[100svh] w-full grid-rows-[auto_minmax(0,1fr)] content-center gap-8 overflow-hidden px-5 py-16 md:px-10 lg:gap-10 lg:px-16"
    >
      {/* COPY AND VISUAL ARE SEPARATE GRID ROWS. An absolutely-positioned band was measured
          overlapping the paragraph at every width — with the copy vertically centred in a
          100svh section there is no offset that holds. As its own row the structure cannot
          reach the type, at any viewport, without any z-index involved. */}
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

      {/* The structure, animated as a 2.5D object: masked and darkened so its flat grey backdrop
          dissolves into the black ground rather than sitting as a slab behind the page. */}
      <div aria-hidden className="pointer-events-none mx-auto w-full max-w-[1400px]">
        <AboutHeroVisual />
      </div>
    </section>
  )
}

export default AboutEditorialHero
