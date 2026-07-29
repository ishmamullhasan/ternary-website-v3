import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutProofOfScaleBlock, Media } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

/**
 * SCENE 04 — the work, as a full-width archive rather than a card grid.
 *
 * REPLACES a 4-up of raised cards with tiny body copy. One project is active at a time: its
 * name is set oversized and its description opens, while the rest stay legible as a navigable
 * index. Scroll changes the active entry; on a pointer device, so does hover. Monochrome
 * throughout — the restrained green appears only on the active entry's index.
 *
 * Cards are gone deliberately. A card grid makes a list of organisations look like a set of
 * products; an archive reads as a record, which is what this is.
 *
 * The hover/active presentation is CSS so it lands on the first frame with no JS in the path;
 * the engine only decides which row is active. On touch, where there is no hover to reveal
 * anything, every description stays open.
 *
 * CONTENT: names and excerpts are the CMS strings, unchanged. No metric, count or claim is
 * introduced.
 */
export function AboutProofOfScaleComponent({ company }: AboutProofOfScaleBlock): JSX.Element | null {
  const hasCompany = Boolean(company?.heading || company?.items?.length)
  if (!hasCompany) return null

  return (
    <section
      data-scene="proof"
      className="ax-bleed ax-scene relative isolate overflow-hidden px-5 py-20 md:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1480px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          {company?.heading ? (
            <h2 className="ax-display-sm ax-h max-w-[14ch] text-cream">
              <span data-ax="mask" className="block">
                {company.heading}
              </span>
            </h2>
          ) : null}
          {company?.description ? (
            <div data-ax="rise" className="ax-body max-w-[46ch]">
              <RichTextComp content={company.description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}
        </div>

        {company?.items?.length ? (
          <div className="ax-proof mt-14 flex flex-col lg:mt-20">
            {company.items.map((item, index) => {
              const logo = item.logo as Media | undefined
              const logoUrl = logo?.url ?? undefined

              return (
                <div
                  key={item.id ?? index}
                  className="ax-proof-row group grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-5 border-t border-line py-7 lg:grid-cols-[auto_minmax(0,1.05fr)_minmax(0,1fr)_auto] lg:gap-x-12 lg:py-9"
                >
                  <span aria-hidden className="ax-meta ax-proof-index pt-3 group-[.is-active]:text-[color:var(--ax-green)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {item.name ? (
                    <div className="flex items-center gap-3">
                      {/* All eight items are `logo: none` in the CMS, so the previous generic
                          cube fallback was not a fallback — it was one lucide `Box` glyph
                          repeated eight times. The name is the stronger mark. */}
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={logo?.alt ?? ''}
                          width={26}
                          height={26}
                          className="h-[26px] w-[26px] shrink-0 object-contain grayscale"
                        />
                      ) : null}
                      <span className="ax-proof-title font-display text-[clamp(1.375rem,3.4vw,2.75rem)] leading-[1.05] font-medium tracking-[-0.04em] text-cream">
                        {item.name}
                      </span>
                    </div>
                  ) : null}

                  {item.excerpt ? (
                    <div className="ax-proof-excerpt col-span-2 lg:col-span-1 lg:pt-2">
                      <p className="ax-body mt-3 max-w-[46ch] lg:mt-0">{item.excerpt}</p>
                    </div>
                  ) : null}

                  <span
                    aria-hidden
                    className="ax-proof-arrow hidden self-center font-mono text-lg text-cream lg:block"
                  >
                    →
                  </span>
                </div>
              )
            })}
            <span aria-hidden className="h-px w-full bg-line" />
          </div>
        ) : null}
      </div>
    </section>
  )
}
