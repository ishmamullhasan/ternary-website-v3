import AboutMotion from '@/components/about/AboutMotion'
import AboutPlate from '@/components/about/AboutPlate'
import MaskText from '@/components/about/MaskText'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutThesisBlock, Media } from '@/payload-types'
import type { CSSProperties, JSX } from 'react'

/**
 * "Our thesis" — the page's first argument, set as a numbered editorial index.
 *
 * REPLACES a six-cell bento in which every cell carried the same lucide `Zap` glyph in the same
 * 48px badge above the same title/description pair. Three consecutive About sections were built
 * from that identical unit, so the page read as one texture repeated for three screens and the
 * icon — seventeen instances of one lightning bolt — decorated without denoting anything.
 *
 * What replaces it is hierarchy: the thesis statement holds a sticky rail on the left while the
 * propositions pass on the right, each indexed, each separated by a drawn hairline. The numerals
 * are the site's existing abstract numbering device, not a stated count, and they track the
 * reader — reached entries stay legible, the live one is bright.
 *
 * CONTENT: every heading, title and excerpt is the CMS string, unchanged. Only the composition,
 * the type and the motion are new.
 */
export function AboutThesisComponent({ heading, description, items }: AboutThesisBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  // The index renders every item in one sequence; the lead is singled out only for its
  // photograph, which is the block's one piece of media.
  const lead = items[0]
  const leadMedia = lead?.media ? (lead.media as Media) : undefined

  return (
    <AboutMotion tag="section" className="w-full">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-20">
        {/* ── the rail ───────────────────────────────────────────────────────
            Sticks through the list on lg so the claim stays present while its support
            passes. Below lg it is simply the section header. */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream text-balance">
            <MaskText>{heading}</MaskText>
          </h2>
          {description ? (
            <div className="am-r mt-5 max-w-[46ch]" style={{ '--am-d': '0.12s' } as CSSProperties}>
              <RichTextComp
                content={description as RichText}
                className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
              />
            </div>
          ) : null}

          {/* Anchors the rail. Without it the sticky column is a heading and three lines beside
              a list six entries long, and the left half of the section is empty for most of its
              height. Drifts against the scroll so the rail has depth as the index passes it.

              ONE plate, rendered at every width — not a `hidden lg:block` desktop copy plus a
              `lg:hidden` mobile copy. A breakpoint pair means whichever half is display:none has
              no box, so it never intersects and never reveals; cross the breakpoint and it has a
              box but is stranded at opacity 0. Below lg the rail simply stacks above the index,
              which puts the plate exactly where the mobile copy would have gone anyway. */}
          <AboutPlate media={leadMedia} tone="azure" className="mt-10 h-[200px] lg:h-[340px]" parallax={20} />
        </div>

        {/* ── the index ──────────────────────────────────────────────────────
            Every proposition, numbered, hairline-separated. `am-step` marks the scroll
            position that drives the numeral state; `am-num` is the numeral it drives. */}
        <ol className="flex flex-col">
          {items.map((item, index) => {
            return (
              <li
                key={item.id ?? `thesis-${index}`}
                className="am-step border-t border-line first:border-t-0"
              >
                <div
                  className="am-r grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 py-8 lg:gap-x-10 lg:py-10"
                  style={{ '--am-d': `${Math.min(index * 0.06, 0.3)}s` } as CSSProperties}
                >
                  <span
                    aria-hidden
                    className="am-num font-mono text-[13px] tabular-nums leading-[1.9] tracking-[0.1em] text-cream"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="flex flex-col gap-2.5">
                    {item.title ? (
                      <h3 className="font-display text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.15] font-medium tracking-[-0.03em] text-cream">
                        {item.title}
                      </h3>
                    ) : null}
                    {item.excerpt ? (
                      <p className="max-w-[54ch] text-[16px] leading-[1.6] text-body">{item.excerpt}</p>
                    ) : null}

                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </AboutMotion>
  )
}
