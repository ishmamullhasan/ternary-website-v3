import AboutScene from '@/components/about/AboutScene'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutBeliefsBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * "Our culture" — the page's plainest and largest typographic section, and its third rhythm:
 * values at near-headline size in an alternating column, with an index in the margin.
 *
 * REPLACES the third and last instance of the About bento.
 *
 * MOTION. Each value enters from the opposite side to the one before it, so the column has a
 * rhythm rather than a single repeated slide. Titles arrive a word at a time. An oversized echo
 * of the section's own heading sits behind the column and moves against the scroll, giving the
 * section depth without adding an ornament that means nothing.
 *
 * THE ECHO IS EXISTING COPY. It repeats the section's own `heading` — no word is invented — and
 * it is `aria-hidden`, so a screen reader hears the heading once, from the real <h2>.
 *
 * CONTENT: headings, titles and excerpts are the CMS strings, unchanged. Titles are split into
 * words for the reveal; the text and its spacing are untouched.
 */

/** Splits a title into words so they can arrive in sequence. Text is unchanged. */
function Words({ text }: { text: string }): JSX.Element {
  const words = text.split(' ')
  return (
    <span data-anim="keywords" className="inline">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span data-keyword className="inline-block">
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  )
}

export function AboutBeliefsComponent({ heading, description, items }: AboutBeliefsBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  return (
    <AboutScene tag="section" className="relative isolate w-full overflow-hidden">
      {/* The echo. Clipped by the section, sits behind everything, and drifts against the
          scroll. Cream at very low alpha so it reads as ground, never as text to be read. */}
      <span
        aria-hidden
        data-anim="bgword"
        className="pointer-events-none absolute -right-[6%] top-[18%] -z-10 hidden max-w-none font-display text-[13vw] leading-none font-medium tracking-[-0.05em] whitespace-nowrap text-cream/[0.035] lg:block"
      >
        {heading}
      </span>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] lg:gap-20">
        {/* ── the rail ─────────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream text-balance">
            <span data-anim="mask" className="block">
              {heading}
            </span>
          </h2>
          {description ? (
            <div data-anim="rise" className="mt-5 max-w-[44ch]">
              <RichTextComp
                content={description as RichText}
                className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
              />
            </div>
          ) : null}

          {/* Decorative index — the values below are all in the accessibility tree in order. */}
          <ol aria-hidden className="mt-10 hidden flex-col gap-2.5 lg:flex">
            {items.map((item, index) => (
              <li key={item.id ?? `belief-num-${index}`} className="flex items-center gap-4">
                <span className="font-mono text-[13px] tracking-[0.1em] text-cream tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-8 bg-line-strong" />
              </li>
            ))}
          </ol>
        </div>

        {/* ── the values ───────────────────────────────────────────────────── */}
        <div data-anim="live-list" className="flex flex-col">
          {items.map((item, index) => (
            <article
              key={item.id ?? `belief-${index}`}
              data-anim="alt"
              data-anim-step
              className="asc-item border-t border-line py-10 first:border-t-0 first:pt-0 lg:py-14 lg:first:pt-0"
            >
              <div className="flex flex-col gap-4">
                {/* Carries the count on narrow screens, where the rail's index is dropped. */}
                <span aria-hidden className="font-mono text-[12px] tracking-[0.14em] text-subtle tabular-nums lg:hidden">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {item.title ? (
                  <h3 className="font-display max-w-[20ch] text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.1] font-medium tracking-[-0.035em] text-cream text-balance">
                    <Words text={item.title} />
                  </h3>
                ) : null}
                {item.excerpt ? (
                  <p className="max-w-[58ch] text-[16px] leading-[1.65] text-body lg:text-[17px]">{item.excerpt}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </AboutScene>
  )
}
