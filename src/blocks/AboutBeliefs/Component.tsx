import AboutMotion from '@/components/about/AboutMotion'
import MaskText from '@/components/about/MaskText'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutBeliefsBlock } from '@/payload-types'
import type { CSSProperties, JSX } from 'react'

/**
 * "Our culture" — set as a counted rail: the values pass at full width while an index in the
 * margin keeps track of where the reader is in them.
 *
 * REPLACES the third and last instance of the About bento — the same round badge, the same
 * repeated `Zap`, the same card. This is the page's closing argument before the team itself, so
 * it is given the plainest and largest typographic treatment of the three: statements at
 * near-headline size with air around them, and no container at all.
 *
 * The rail is the only ornament, and it is functional — the numeral for the value you are
 * reading is bright, the ones behind you stay legible, the ones ahead recede. Under reduced
 * motion or without JavaScript it is a static list of numerals beside a list of values, which
 * is exactly what it is.
 *
 * CONTENT: headings, titles and excerpts are the CMS strings, unchanged.
 */
export function AboutBeliefsComponent({ heading, description, items }: AboutBeliefsBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  return (
    <AboutMotion tag="section" className="w-full">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] lg:gap-20">
        {/* ── the rail ───────────────────────────────────────────────────────
            Heading, standfirst, and the index. Sticks on lg so the count stays in the
            margin while the values pass it. */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream text-balance">
            <MaskText>{heading}</MaskText>
          </h2>
          {description ? (
            <div className="am-r mt-5 max-w-[44ch]" style={{ '--am-d': '0.12s' } as CSSProperties}>
              <RichTextComp
                content={description as RichText}
                className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
              />
            </div>
          ) : null}

          {/* The index. Decorative — the values below are all in the accessibility tree in
              order, so this repeats nothing a screen reader needs. */}
          <ol aria-hidden className="mt-10 hidden flex-col gap-2.5 lg:flex">
            {items.map((item, index) => (
              <li key={item.id ?? `belief-num-${index}`} className="flex items-center gap-4">
                {/* Exactly one `.am-num` per value — AboutMotion pairs numerals to steps by
                    index, so a second one here would shift the whole mapping by one. */}
                <span className="am-num font-mono text-[13px] tabular-nums tracking-[0.1em] text-cream">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-8 bg-line-strong" />
              </li>
            ))}
          </ol>
        </div>

        {/* ── the values ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          {items.map((item, index) => {
            return (
              <article
                key={item.id ?? `belief-${index}`}
                className="am-step border-t border-line py-10 first:border-t-0 first:pt-0 lg:py-14 lg:first:pt-0"
              >
                <div className="am-r flex flex-col gap-4" style={{ '--am-d': '0.06s' } as CSSProperties}>
                  {/* Carries the count on narrow screens, where the rail's index is dropped. */}
                  <span aria-hidden className="font-mono text-[12px] tabular-nums tracking-[0.14em] text-subtle lg:hidden">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {item.title ? (
                    <h3 className="font-display max-w-[20ch] text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.1] font-medium tracking-[-0.035em] text-cream text-balance">
                      {item.title}
                    </h3>
                  ) : null}
                  {item.excerpt ? (
                    <p className="max-w-[58ch] text-[16px] leading-[1.65] text-body lg:text-[17px]">{item.excerpt}</p>
                  ) : null}

                  {/* No plate here, deliberately. Every item in this block is `media: none` in
                      the CMS, so a plate per value would mean five identical gradient panels
                      down one column — colour noise, and the section is meant to be the page's
                      plainest and most typographic. The thesis and the approach each carry one. */}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </AboutMotion>
  )
}
