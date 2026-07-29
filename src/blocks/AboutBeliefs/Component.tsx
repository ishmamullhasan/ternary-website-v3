import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutBeliefsBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * SCENE 05 — culture, as a typographic sequence rather than a repeated list.
 *
 * Each value gets its own near-full-screen moment: the keyword set very large and revealed
 * through a line mask, its description held at readable size beneath. Alternate values invert
 * the ground — warm white with black type — so the page swings between the two brand states as
 * it is read instead of staying uniformly dark. That inversion is the section's rhythm; no
 * additional colour is introduced.
 *
 * REPLACES a five-cell bento of identical cards, each with the same round badge and the same
 * repeated `Zap` glyph.
 *
 * CONTENT: every heading, title and excerpt is the CMS string, unchanged.
 */
export function AboutBeliefsComponent({ heading, description, items }: AboutBeliefsBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  return (
    <section
      data-scene="culture"
      className="ax-black ax-scene relative isolate w-full overflow-hidden px-5 py-24 md:px-10 lg:px-16 lg:py-32"
    >
      <span aria-hidden data-ax="wipe" className="ax-wipe ax-wipe-black" />
      <div className="ax-above mx-auto w-full max-w-[1400px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          <h2 className="ax-label">
            <span data-ax="mask" className="block">
              {heading}
            </span>
          </h2>
          {description ? (
            <div data-ax="rise" className="ax-copy">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-20 lg:mt-24 lg:gap-32">
          {items.map((item, index) => (
            <article
              key={item.id ?? `culture-${index}`}
              className="ax-state grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end lg:gap-20"
            >
              <div>
                <span aria-hidden className="ax-label block">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.title ? (
                  <h3 className="ax-hx ax-h mt-5 max-w-[11ch] text-balance">
                    <span data-ax="kw" className="block">
                      {item.title}
                    </span>
                  </h3>
                ) : null}
              </div>
              {item.excerpt ? <p className="ax-copy">{item.excerpt}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
