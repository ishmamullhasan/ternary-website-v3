import AboutScene from '@/components/about/AboutScene'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutProofOfScaleBlock, Media } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

/**
 * "Proof of work in the real world" — the organisations, as an editorial register.
 *
 * REPLACES a 4-up of raised `bg-ink` cards. Cards make a list of clients look like a set of
 * products; a register — index, name, one line of context, rule — reads as a record, which is
 * what this is.
 *
 * MOTION. Rows reveal in sequence as the register comes up. On a pointer device, hovering one
 * row lifts it and pushes it right while the rest recede, and its arrow slides in — so the list
 * has a clear active state instead of eight rows of equal weight. The index numerals ride the
 * scroll.
 *
 * The hover state is CSS, not JS, so it responds on the first frame the pointer arrives. It is
 * scoped to `(hover: hover)` — on touch there is no hover to reveal it, so the arrow simply
 * stays visible rather than hiding behind an interaction that cannot happen.
 *
 * CONTENT: names and excerpts are the CMS strings, unchanged. No metric, count or claim is
 * introduced.
 */
export function AboutProofOfScaleComponent({ company }: AboutProofOfScaleBlock): JSX.Element | null {
  const hasCompany = Boolean(company?.heading || company?.items?.length)
  if (!hasCompany) return null

  return (
    <AboutScene tag="section" className="w-full">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        {company?.heading ? (
          <h2 className="font-display max-w-[18ch] text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream text-balance">
            <span data-anim="mask" className="block">
              {company.heading}
            </span>
          </h2>
        ) : null}
        {company?.description ? (
          <div data-anim="rise" className="max-w-[48ch]">
            <RichTextComp
              content={company.description as RichText}
              className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
            />
          </div>
        ) : null}
      </div>

      {company?.items?.length ? (
        <div data-anim-group className="asc-rows mt-12 flex flex-col lg:mt-16">
          {company.items.map((item, index) => {
            const logo = item.logo as Media | undefined
            const logoUrl = logo?.url ?? undefined

            return (
              <div
                key={item.id ?? index}
                data-anim-item
                data-anim-step
                className="asc-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-5 border-t border-line py-6 lg:grid-cols-[auto_minmax(0,0.9fr)_minmax(0,1.1fr)_auto] lg:gap-x-10 lg:py-7"
              >
                <span
                  aria-hidden
                  data-anim="num"
                  className="font-mono text-[13px] tracking-[0.1em] text-cream tabular-nums"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                {item.name ? (
                  <div className="flex items-center gap-2.5">
                    {/* Logo when the CMS has one — nothing when it does not. All eight items are
                        `logo: none` on the staging cluster, so the previous generic-cube
                        fallback was not a fallback, it was the design: one lucide `Box` glyph
                        eight times over. The name is the stronger mark. */}
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={logo?.alt ?? ''}
                        width={22}
                        height={22}
                        className="h-[22px] w-[22px] shrink-0 object-contain grayscale"
                      />
                    ) : null}
                    <span className="font-display text-[19px] leading-[1.2] font-medium tracking-[-0.03em] text-cream lg:text-[21px]">
                      {item.name}
                    </span>
                  </div>
                ) : null}

                {item.excerpt ? (
                  <p className="col-span-2 mt-2 text-[15px] leading-[1.62] text-body lg:col-span-1 lg:mt-0">
                    {item.excerpt}
                  </p>
                ) : null}

                <span aria-hidden className="asc-arrow hidden font-mono text-[15px] text-cream lg:block">
                  →
                </span>
              </div>
            )
          })}
          <span aria-hidden className="h-px w-full bg-line" />
        </div>
      ) : null}
    </AboutScene>
  )
}
