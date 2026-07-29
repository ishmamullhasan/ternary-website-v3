import { ThesisSystem } from '@/components/about/AboutSystems'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutThesisBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * SCENE 02 — the thesis as a system the reader travels through.
 *
 * REPLACES seven rows of heading-plus-paragraph (before that, a six-cell bento where every cell
 * carried the same lucide `Zap` glyph). The statements are now anchored to nodes in one field:
 * scroll moves a camera through it, the wires draw progressively, signals run the spokes, and
 * the statement being read holds the frame at full size while the others recede.
 *
 * RESPONSIVE. Above 900px the scene pins and the camera pushes deeper with each hand-over.
 * Below it there is no pin: the same statements become a vertical connected journey down a rail
 * that draws as it is scrolled — no viewport-tall empty box, everything in normal flow.
 *
 * CONTENT: every heading, title and excerpt is the CMS string, unchanged.
 */
export function AboutThesisComponent({ heading, description, items }: AboutThesisBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  // The stage is held open at the longest entry so nothing jumps as the copy changes length.
  // Sized from the longest title AND the longest excerpt independently — not from one item.
  // Using a single "longest" item sized the stage to whichever had the longest excerpt, which
  // was not the item with the tallest title, so the tallest state overflowed the clip and its
  // last line was cut off.
  const longestTitle = items.reduce((a, s) => ((s.title ?? '').length > (a.title ?? '').length ? s : a), items[0])
  const longestExcerpt = items.reduce((a, s) => ((s.excerpt ?? '').length > (a.excerpt ?? '').length ? s : a), items[0])

  return (
    <section
      data-scene="thesis"
      className="ax-bleed ax-scene ax-scene-tall relative isolate overflow-hidden px-5 py-20 md:px-8 lg:px-12 lg:py-0"
    >
      {/* The field the camera moves through. Sits behind the type, masked at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(105%_95%_at_60%_45%,#000_0%,rgba(0,0,0,0.35)_58%,transparent_86%)]"
      >
        <ThesisSystem />
      </div>

      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
        {/* The claim. Stays in frame while the system is travelled. */}
        <div className="flex flex-col gap-5">
          <h2 className="ax-display-sm ax-h max-w-[12ch] text-cream">
            <span data-ax="mask-dir" className="block">
              {heading}
            </span>
          </h2>
          {description ? (
            <div data-ax="rise" className="ax-body max-w-[42ch]">
              <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}
          <div aria-hidden className="ax-dots mt-4 flex gap-2">
            {items.map((_, i) => (
              <span key={i} className="ax-dot" />
            ))}
          </div>
        </div>

        {/* The statements. Absolute states when pinned; a vertical journey when not. */}
        <div className="relative">
          {/* The rail only exists in the narrow, non-pinned layout. */}
          <span
            aria-hidden
            data-ax="v-rail"
            className="absolute top-2 bottom-2 left-[7px] w-px bg-line-strong lg:hidden"
          />

          <div className="ax-stack">
            <div aria-hidden className="ax-sizer">
              <h3 className="ax-display-sm">{longestTitle?.title}</h3>
              <p className="ax-body mt-5 max-w-[46ch]">{longestExcerpt?.excerpt}</p>
            </div>

            {items.map((item, index) => (
              <article key={item.id ?? `thesis-${index}`} className="ax-state relative pl-8 lg:pl-0">
                {/* Journey marker — the node on the rail, narrow layout only. */}
                <span
                  aria-hidden
                  className="absolute top-2 left-0 h-3.5 w-3.5 rounded-full border border-line-strong bg-page lg:hidden"
                />
                <span aria-hidden className="ax-meta block">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.title ? (
                  <h3 className="ax-display-sm ax-h mt-3 max-w-[16ch] text-cream text-balance">{item.title}</h3>
                ) : null}
                {item.excerpt ? <p className="ax-body mt-5 max-w-[46ch]">{item.excerpt}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
