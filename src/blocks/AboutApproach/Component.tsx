import AboutScene from '@/components/about/AboutScene'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutApproachBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * "The Ternary Way" — a pinned scene. The section holds while the practices pass one at a time
 * against a plate that keeps turning, so the five read as one continuous shot rather than as
 * five cards in a grid.
 *
 * REPLACES a bento built from the same unit as the sections either side of it. Pinning is what
 * makes this one structurally different from them: "Our thesis" is a vertical index, this is a
 * held scene, "Our culture" is an alternating column. Three rhythms, one system.
 *
 * DEGRADES DELIBERATELY. The pin, the absolute stacking and the one-at-a-time behaviour only
 * exist once AboutScene sets `data-scene="on"`, which happens on desktop pointer widths and
 * never under reduced motion. Below that the practices are a plain readable stack — never four
 * hidden behind an animation that will not run. The sizer holds the stage open at the tallest
 * slide so nothing jumps as the copy changes length.
 *
 * The plate is the section's existing emerald gradient — the brand's colour lives in the
 * plates, which is why everything around it stays monochrome.
 *
 * CONTENT: headings, titles and excerpts are CMS strings, unchanged.
 */
const PLATE = 'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)'

export function AboutApproachComponent({ heading, description, items }: AboutApproachBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  // The stage is held open at the longest title + excerpt so a shorter practice does not
  // collapse it mid-scene.
  const longest = items.reduce(
    (a, s) => ((s.excerpt ?? '').length > (a.excerpt ?? '').length ? s : a),
    items[0],
  )

  return (
    <AboutScene tag="section" className="w-full">
      {/* THE PANEL IS THE PINNED ELEMENT. Pinning an inner div left its `bg-main` parent
          scrolling away behind it, so the panel slid off while the content stayed fixed on bare
          page ground. Pinning the panel itself keeps the section intact — background, heading
          and stage travel together — and the heading stays on screen while the practices
          change, which is the point of holding the section in the first place. */}
      <div
        data-anim="scene"
        className="flex w-full flex-col justify-center rounded-md bg-main px-6 py-12 md:px-9 lg:min-h-[80vh] lg:px-12 lg:py-16"
      >
        {/* ── header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <h2 className="font-display max-w-[16ch] text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream">
            <span data-anim="mask" className="block">
              {heading}
            </span>
          </h2>
          {description ? (
            <div data-anim="rise" className="max-w-[48ch]">
              <RichTextComp
                content={description as RichText}
                className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-10 lg:mt-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          {/* The plate. Scales and turns across the scene, driven by the scene timeline. */}
          <div className="asc-scene-plate relative h-[220px] overflow-hidden rounded-md lg:h-[420px]">
            <span aria-hidden className="absolute inset-0" style={{ backgroundImage: PLATE }} />
            <span
              aria-hidden
              className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
            />
          </div>

          {/* The stage. */}
          <div>
            <div className="asc-stage">
              {/* Holds the stage open at the tallest slide. Hidden from sight and from screen
                  readers — the real slides carry the content. */}
              <div aria-hidden className="asc-sizer">
                <h3 className="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.1] font-medium tracking-[-0.035em]">
                  {longest?.title}
                </h3>
                <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.62] lg:text-[17px]">{longest?.excerpt}</p>
              </div>

              {items.map((item, index) => (
                <article key={item.id ?? `approach-${index}`} className="asc-slide">
                  <span
                    aria-hidden
                    className="font-mono text-[12px] tracking-[0.14em] text-subtle tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.title ? (
                    <h3 className="font-display mt-3 max-w-[18ch] text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.1] font-medium tracking-[-0.035em] text-cream text-balance">
                      {item.title}
                    </h3>
                  ) : null}
                  {item.excerpt ? (
                    <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.62] text-body lg:text-[17px]">
                      {item.excerpt}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>

            {/* Position indicator. Decorative — every slide stays in the accessibility tree, so
                this repeats nothing a screen reader needs. */}
            <div aria-hidden className="asc-dots mt-10 flex gap-2">
              {items.map((_, index) => (
                <span key={index} className="asc-dot" />
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </AboutScene>
  )
}
