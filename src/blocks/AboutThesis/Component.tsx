import { ThesisDiagram } from '@/components/about/AboutGraphics'
import AboutScene from '@/components/about/AboutScene'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutThesisBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * "Our thesis" — a numbered editorial index against a sticky rail.
 *
 * REPLACES a six-cell bento in which every cell carried the same lucide `Zap` glyph in the same
 * 48px badge above the same title/description pair — seventeen instances of one lightning bolt
 * across the three About sections built that way.
 *
 * MOTION. The headline's lines enter from alternating sides. The rail holds a node diagram whose
 * connections draw as the section is scrolled and whose signals run the wires — the section's
 * claim (separate points wired into one system, with traffic on it) drawn rather than asserted.
 * Each principle reveals in sequence, its index numeral rides the scroll, and the principle
 * being read holds full strength while the others sit back.
 *
 * The numerals are the site's existing abstract numbering device, not a stated count.
 *
 * CONTENT: every heading, title and excerpt is the CMS string, unchanged.
 */
export function AboutThesisComponent({ heading, description, items }: AboutThesisBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  return (
    <AboutScene tag="section" className="w-full">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-20">
        {/* ── the rail ───────────────────────────────────────────────────────
            Sticks through the index on lg so the claim stays present, and the diagram beside
            it, while its support passes. */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream text-balance">
            <span data-anim="mask-dir" className="block">
              {heading}
            </span>
          </h2>
          {description ? (
            <div data-anim="rise" className="mt-5 max-w-[46ch]">
              <RichTextComp
                content={description as RichText}
                className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
              />
            </div>
          ) : null}

          {/* Anchors the rail — without it the sticky column is a heading and three lines
              beside a six-entry list, and the left half of the section is empty for most of
              its height. */}
          <div className="mt-10 h-[220px] w-full lg:h-[320px]">
            <ThesisDiagram />
          </div>
        </div>

        {/* ── the index ──────────────────────────────────────────────────────
            `live-list` drives the active-state emphasis; `anim-step` scopes each numeral's
            scrub to its own row. */}
        <ol data-anim="live-list" className="flex flex-col">
          {items.map((item, index) => (
            <li
              key={item.id ?? `thesis-${index}`}
              data-anim-step
              className="asc-item border-t border-line first:border-t-0"
            >
              <div
                data-anim="rise"
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 py-8 lg:gap-x-10 lg:py-10"
              >
                <span
                  aria-hidden
                  data-anim="num"
                  className="font-mono text-[13px] leading-[1.9] tracking-[0.1em] text-cream tabular-nums"
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
          ))}
        </ol>
      </div>
    </AboutScene>
  )
}
