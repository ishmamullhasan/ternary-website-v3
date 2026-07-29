import { ThesisSystem } from '@/components/about/AboutSystems'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutThesisBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * SCENE 02 — "Our thesis", as an editorial slider.
 *
 * REPLACES a full-bleed node field with a camera travelling through it. That version put
 * circles and connections directly behind the headline and body copy, set the active headline
 * larger than the section title, and let the two columns compete for the same attention.
 *
 * The composition now: a 32/68 split with a real gutter, both columns centred against the
 * viewport, and the graphic confined to a canvas that starts at 70% of the right column — past
 * where the copy can ever reach. The structure is what keeps the animation off the text; there
 * is no positioning to get wrong.
 *
 * The section title is the largest thing in the scene, the active headline sits under it, and
 * the description under that — one focal order rather than two competing ones.
 *
 * RESPONSIVE. Below 900px there is no pin and no canvas: the six theses become a plain vertical
 * sequence, each with a single small marker beside it.
 *
 * CONTENT: every heading, title and excerpt is the CMS string, unchanged.
 */
export function AboutThesisComponent({ heading, description, items }: AboutThesisBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  return (
    <section
      data-scene="thesis"
      className="ax-scene relative isolate w-full overflow-hidden px-5 py-20 md:px-8 lg:px-12 lg:py-0"
    >
      <div className="ax-th-grid">
        {/* ── left: the claim, the standfirst, the pagination ──────────────── */}
        <div className="flex flex-col gap-7">
          <h2 className="ax-th-title ax-h text-cream">
            <span data-ax="th-title" className="block">
              {heading}
            </span>
          </h2>

          {description ? (
            <div data-ax="th-intro" className="ax-th-intro">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}

          {/* Decorative: the six theses are all in the accessibility tree below, in order. */}
          <div aria-hidden className="ax-th-dots mt-2">
            {items.map((_, i) => (
              <span key={i} className="ax-th-dot" data-th-dot={i} />
            ))}
          </div>
        </div>

        {/* ── right: the active thesis, and the canvas beyond it ───────────── */}
        <div className="ax-th-right">
          <div className="ax-th-copy">
            <div className="ax-th-stack">
              {items.map((item, index) => (
                <article key={item.id ?? `thesis-${index}`} className="ax-th-slide" data-th-slide={index}>
                  <div className="flex items-center gap-3">
                    {/* The marker beside each item in the mobile sequence; hidden once staged. */}
                    <span aria-hidden className="ax-th-mark h-6 self-stretch lg:hidden" data-th-mark={index} />
                    <span aria-hidden className="ax-th-index">
                      {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                    </span>
                  </div>

                  {item.title ? (
                    <h3 className="ax-th-head ax-h mt-4 text-cream">
                      <span data-th-head className="block">
                        {item.title}
                      </span>
                    </h3>
                  ) : null}

                  {item.excerpt ? (
                    <p className="ax-th-desc" data-th-desc>
                      {item.excerpt}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          {/* Far-right canvas. Desktop only — below 900px the sequence carries its own markers
              and a full node system would be noise on a narrow screen. */}
          <div aria-hidden className="ax-th-canvas hidden lg:block">
            <ThesisSystem />
          </div>
        </div>
      </div>
    </section>
  )
}
