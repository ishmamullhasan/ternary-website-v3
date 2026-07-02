import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutProofOfScaleBlock, Media } from '@/payload-types'
import { Box } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MOTION_BLOCK = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
}

/**
 * Proof of Scale — two separate `bg-main` panels (design nodes 1255:2920 + 1615:1912), spaced with
 * the page's own block rhythm so they read as distinct sections:
 *   1. "Proof at Scale" — a row of four large display stats with Poppins labels.
 *   2. "We partner with ambitious brands" — a 4-up grid of bordered `bg-page` company cards
 *      (excerpt → uppercase tag pills → icon + brand footer).
 * All copy is CMS-driven; arrays are guarded so missing data collapses rather than rendering empty.
 */
export function AboutProofOfScaleComponent({
  heading,
  description,
  stats,
  company,
}: AboutProofOfScaleBlock): JSX.Element | null {
  const hasStats = Boolean(heading || stats?.length)
  const hasCompany = Boolean(company?.heading || company?.items?.length)

  if (!hasStats && !hasCompany) return null

  return (
    <div className="flex flex-col gap-16 lg:gap-[72px]">
      {/* Panel 1 — Stats */}
      {hasStats ? (
        <section className="rounded-md bg-main p-6 lg:px-9 lg:py-12">
          <Motion {...MOTION_BLOCK} transition={{ duration: 0.6, ease: EASE }}>
            {heading ? (
              <h2 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream lg:text-3xl">
                {heading}
              </h2>
            ) : null}
            {description ? (
              <RichTextComp
                content={description as RichText}
                className="mt-4 max-w-2xl prose-p:mb-0 prose-p:text-base prose-p:leading-relaxed prose-p:text-body"
              />
            ) : null}
          </Motion>

          {stats?.length ? (
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:mt-14 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <Motion
                  key={stat.id ?? i}
                  className="text-center"
                  {...MOTION_BLOCK}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.06, 0.4) }}
                >
                  <div className="font-display text-[clamp(3.5rem,8vw,96px)] font-semibold leading-[1.15] tracking-[-0.05em] text-cream">
                    {stat.value}
                  </div>
                  <div className="mt-2 font-display text-2xl font-medium tracking-[-0.05em] text-cream">
                    {stat.label}
                  </div>
                </Motion>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Panel 2 — Enterprise grid */}
      {hasCompany ? (
        <section className="rounded-md bg-main p-6 lg:px-9 lg:py-12">
          <Motion {...MOTION_BLOCK} transition={{ duration: 0.6, ease: EASE }}>
            {company?.heading ? (
              <h2 className="max-w-xl font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream lg:text-3xl">
                {company.heading}
              </h2>
            ) : null}
            {company?.description ? (
              <RichTextComp
                content={company.description as RichText}
                className="mt-4 max-w-2xl prose-p:mb-0 prose-p:text-base prose-p:leading-relaxed prose-p:text-body"
              />
            ) : null}
          </Motion>

          {company?.items?.length ? (
            // Figma right-aligns the 4-up card grid at a fixed 1171px (≈280px cards), leaving the
            // left edge open under the heading; below lg it relaxes to a full-width 1/2-col stack.
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:ml-auto lg:mt-8 lg:max-w-[1171px] lg:grid-cols-4">
              {company.items.map((item, index) => {
                const logoUrl = (item.logo as Media | undefined)?.url ?? undefined
                const logoAlt = (item.logo as Media | undefined)?.alt ?? item.name ?? ''
                return (
                  <Motion
                    key={item.id ?? index}
                    className="group flex h-full min-h-[267px] flex-col justify-between rounded-sm bg-ink px-4 pb-4 pt-6 transition-[transform,background-color] duration-300 ease-out hover:-translate-y-1 hover:bg-[#151414]"
                    {...MOTION_BLOCK}
                    transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
                  >
                    <div className="flex flex-col gap-4">
                      {item.excerpt ? <p className="text-base leading-snug text-body/90">{item.excerpt}</p> : null}
                      {item.stack?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {item.stack.map((tag, tagIndex) => (
                            <span
                              key={tag.id ?? tagIndex}
                              className="rounded-full border border-subtle bg-main px-4 py-1 text-xs font-normal uppercase tracking-[-0.025em] text-cream/90"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {item.name ? (
                      <div className="mt-8 flex items-center gap-2 text-cream">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={logoAlt}
                            width={24}
                            height={24}
                            className="h-6 w-6 shrink-0 object-contain"
                          />
                        ) : (
                          <Box aria-hidden className="h-6 w-6 text-cream/80" />
                        )}
                        <span className="text-2xl font-bold tracking-[-0.025em]">{item.name}</span>
                      </div>
                    ) : null}
                  </Motion>
                )
              })}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
