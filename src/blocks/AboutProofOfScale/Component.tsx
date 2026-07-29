import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutProofOfScaleBlock, Media } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

/**
 * SCENE 04 — the work, as a warm-white editorial archive.
 *
 * REPLACES a 4-up of raised cards with tiny body copy, then a flat eight-row register where
 * every project carried identical weight. Neither told the reader where to look.
 *
 * HIERARCHY. Three projects are featured at full editorial size; the rest follow as a numbered
 * secondary archive. **No project is hidden or removed** — all eight are present, in their CMS
 * order, with their names, descriptions and routes unchanged. Featuring is presentation only.
 *
 * The three are named explicitly rather than sliced off the top, because the CMS order puts
 * LankaBangla Securities last: taking the first three would have featured Turfly and Alley
 * Analytix and buried the air-gapped LLM work. Matching on name keeps the choice deliberate and
 * survives a reorder in the CMS; anything not matched simply falls to the archive.
 *
 * INTERACTION. One project is active at a time — scroll sets it, and on a pointer device so does
 * hover. The active row is marked by a solid rule and a slight shift, and its arrow slides in.
 * Every project stays fully legible at all times — nothing is dimmed or collapsed away.
 *
 * CONTENT: names and excerpts are the CMS strings, unchanged. No metric, count or claim is
 * introduced.
 */
const FEATURED = ['Counterfoil Continuum', 'LankaBangla Securities', 'Alley Analytix']

export function AboutProofOfScaleComponent({ company }: AboutProofOfScaleBlock): JSX.Element | null {
  const hasCompany = Boolean(company?.heading || company?.items?.length)
  if (!hasCompany) return null

  const items = company?.items ?? []
  const isFeatured = (name?: string | null): boolean => Boolean(name && FEATURED.includes(name.trim()))
  const featured = items.filter((i) => isFeatured(i.name))
  const archive = items.filter((i) => !isFeatured(i.name))

  return (
    <section
      data-scene="proof"
      className="ax-white ax-scene relative isolate w-full overflow-hidden px-5 py-24 md:px-10 lg:px-16 lg:py-32"
    >
      <span aria-hidden data-ax="wipe" className="ax-wipe ax-wipe-white" />
      <div className="ax-above mx-auto w-full max-w-[1400px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          {company?.heading ? (
            <h2 className="ax-label">
              <span data-ax="mask" className="block">
                {company.heading}
              </span>
            </h2>
          ) : null}
          {company?.description ? (
            <div data-ax="rise" className="ax-copy">
              <RichTextComp content={company.description as RichText} className="prose-p:mb-0 prose-p:text-inherit" />
            </div>
          ) : null}
        </div>

        {/* ── featured ───────────────────────────────────────────────────── */}
        {featured.length ? (
          <div className="ax-proof mt-16 flex flex-col lg:mt-24">
            {featured.map((item, index) => {
              const logo = item.logo as Media | undefined
              return (
                <article
                  key={item.id ?? `f${index}`}
                  className="ax-proof-row group grid grid-cols-1 gap-x-12 gap-y-4 border-t border-[rgba(9,9,9,0.14)] py-10 lg:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,0.9fr)_auto] lg:items-start lg:py-14"
                >
                  <span aria-hidden className="ax-label ax-proof-index pt-3">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {item.name ? (
                    <div className="flex items-center gap-3">
                      {logo?.url ? (
                        <Image
                          src={logo.url}
                          alt={logo.alt ?? ''}
                          width={30}
                          height={30}
                          className="h-[30px] w-[30px] shrink-0 object-contain grayscale"
                        />
                      ) : null}
                      <h3 className="ax-proof-title font-display text-[clamp(2rem,5.2vw,4.75rem)] leading-[0.9] font-medium tracking-[-0.055em]">
                        {item.name}
                      </h3>
                    </div>
                  ) : null}

                  {item.excerpt ? (
                    <div className="ax-proof-excerpt lg:pt-3">
                      <p className="ax-copy">{item.excerpt}</p>
                    </div>
                  ) : null}

                  <span aria-hidden className="ax-proof-arrow hidden self-center font-mono text-2xl lg:block">
                    →
                  </span>
                </article>
              )
            })}
          </div>
        ) : null}

        {/* ── archive ────────────────────────────────────────────────────────
            Quieter, but every entry keeps its name and its sentence. Nothing is dropped. */}
        {archive.length ? (
          <div className="ax-proof mt-16 flex flex-col lg:mt-24">
            {archive.map((item, index) => (
              <article
                key={item.id ?? `a${index}`}
                className="ax-proof-row group grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 gap-y-2 border-t border-[rgba(9,9,9,0.12)] py-6 lg:grid-cols-[auto_minmax(0,0.85fr)_minmax(0,1.15fr)_auto] lg:gap-x-12 lg:py-7"
              >
                <span aria-hidden className="ax-label ax-proof-index">
                  {String(featured.length + index + 1).padStart(2, '0')}
                </span>
                {item.name ? (
                  <h3 className="ax-proof-title font-display text-[clamp(1.25rem,2.2vw,2rem)] leading-[1] font-medium tracking-[-0.04em]">
                    {item.name}
                  </h3>
                ) : null}
                {item.excerpt ? (
                  <div className="ax-proof-excerpt col-span-2 lg:col-span-1">
                    <p className="ax-copy text-[16px] lg:text-[17px]">{item.excerpt}</p>
                  </div>
                ) : null}
                <span aria-hidden className="ax-proof-arrow hidden self-center font-mono text-lg lg:block">
                  →
                </span>
              </article>
            ))}
            <span aria-hidden className="ax-hair" />
          </div>
        ) : null}
      </div>
    </section>
  )
}
