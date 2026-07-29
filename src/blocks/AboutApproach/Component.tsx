import { WaySystem } from '@/components/about/AboutSystems'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutApproachBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * SCENE 03 — The Ternary Way, as one living system that rearranges itself.
 *
 * THE GREEN PANEL IS GONE. There is no image, gradient rectangle or placeholder here any more —
 * and there never was a photograph behind it: every item in this block is `media: none` in the
 * CMS, so the old component's "grayscale photo" branch had never once rendered. What replaces
 * it is a nine-node system whose geometry argues each principle in turn:
 *
 *   Absolute ownership     every path draws toward one centre
 *   Transparent execution  the full lattice opens, nothing hidden
 *   Proximity to impact    the cluster pulls close together
 *   Certified global hub   two connected centres
 *   Three ways to engage   three coordinated paths
 *
 * The engine interpolates every node between those layouts and rebuilds the wires each frame,
 * so the system morphs continuously — it is never a swap between static slides.
 *
 * RESPONSIVE. Pins above 900px, one principle per state. Below it the system still morphs,
 * driven by the section's own scroll progress, with the principles stacked beneath it in normal
 * flow — no pin, no artificial blank scroll space.
 *
 * CONTENT: headings, titles and excerpts are CMS strings, unchanged.
 */
export function AboutApproachComponent({ heading, description, items }: AboutApproachBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  // Sized from the longest title AND the longest excerpt independently — not from one item.
  // Using a single "longest" item sized the stage to whichever had the longest excerpt, which
  // was not the item with the tallest title, so the tallest state overflowed the clip and its
  // last line was cut off.
  const longestTitle = items.reduce((a, s) => ((s.title ?? '').length > (a.title ?? '').length ? s : a), items[0])
  const longestExcerpt = items.reduce((a, s) => ((s.excerpt ?? '').length > (a.excerpt ?? '').length ? s : a), items[0])

  return (
    <section
      data-scene="way"
      className="ax-black ax-scene ax-scene-tall relative isolate w-full overflow-hidden px-5 py-24 md:px-10 lg:px-16 lg:py-0"
    >
      <span aria-hidden data-ax="wipe" className="ax-wipe ax-wipe-black" />
      <div className="ax-above mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-24">
        {/* The system. */}
        <div className="relative order-2 h-[300px] w-full lg:order-1 lg:h-[62vh]">
          <WaySystem />
        </div>

        {/* The principles. */}
        <div className="order-1 flex flex-col lg:order-2">
          <h2 className="ax-hx-sm ax-h max-w-[12ch]">
            <span data-ax="mask" className="block">
              {heading}
            </span>
          </h2>
          {description ? (
            <div data-ax="rise" className="ax-copy mt-6">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}

          <div className="ax-stack mt-10 lg:mt-14">
            <div aria-hidden className="ax-sizer">
              <h3 className="ax-hx-sm max-w-[14ch]">{longestTitle?.title}</h3>
              <p className="ax-copy mt-6">{longestExcerpt?.excerpt}</p>
            </div>

            {items.map((item, index) => (
              <article key={item.id ?? `way-${index}`} className="ax-state">
                <span aria-hidden className="ax-label block">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.title ? (
                  <h3 className="ax-hx-sm ax-h mt-4 max-w-[14ch] text-balance">{item.title}</h3>
                ) : null}
                {item.excerpt ? <p className="ax-copy mt-6">{item.excerpt}</p> : null}
              </article>
            ))}
          </div>

          <div aria-hidden className="ax-dots mt-10 flex gap-2">
            {items.map((_, i) => (
              <span key={i} className="ax-dot" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
