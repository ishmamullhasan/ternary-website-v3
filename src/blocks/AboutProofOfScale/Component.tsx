import Motion from '@/components/animation/motion'
import type { AboutProofOfScaleBlock, Media } from '@/payload-types'
import { Box } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Proof-of-scale (design nodes 1255:2920 + 1615:1912). Two stacked moments on the warm `bg-main`
 * panel: a row of four large "120+" display stats with Inter labels, then the "We partner with
 * ambitious brands" enterprise grid — a full-width 4-up grid of bordered `bg-ink` cards (paragraph
 * → tag pills → icon + brand footer). All copy is CMS-driven and arrays are guarded so missing data
 * collapses gracefully rather than rendering empty rows.
 */
export function AboutProofOfScaleComponent({
  heading,
  description,
  stats,
  company,
}: AboutProofOfScaleBlock): JSX.Element | null {
  const motionBlockProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' as const },
  }

  if (!heading && !stats?.length && !company?.items?.length) return null

  return (
    <section className="rounded-md bg-main p-6 lg:p-12">
      {/* Stats */}
      {(heading || stats?.length) && (
        <div className="mb-16 lg:mb-20">
          <Motion {...motionBlockProps} transition={{ duration: 0.6, ease: EASE }}>
            {heading ? (
              <h2 className="font-display text-2xl font-medium tracking-[-0.05em] text-cream lg:text-3xl">{heading}</h2>
            ) : null}
            {description ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">{description}</p> : null}
          </Motion>

          {stats?.length ? (
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:mt-14 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <Motion
                  key={stat.id ?? i}
                  className="text-center"
                  {...motionBlockProps}
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
        </div>
      )}

      {/* Enterprise grid */}
      {(company?.heading || company?.items?.length) && (
        <div>
          <Motion {...motionBlockProps} transition={{ duration: 0.6, ease: EASE }}>
            {company?.heading ? (
              <h2 className="max-w-3xl font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream lg:text-3xl">
                {company.heading}
              </h2>
            ) : null}
            {company?.description ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-body">{company.description}</p>
            ) : null}
          </Motion>

          {company?.items?.length ? (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
              {company.items.map((item, index) => {
                const logoUrl = (item.logo as Media | undefined)?.url ?? undefined
                const logoAlt = (item.logo as Media | undefined)?.alt ?? item.name ?? ''
                return (
                  <Motion
                    key={item.id ?? index}
                    className="group flex h-full min-h-[360px] flex-col justify-between rounded-sm border border-white/5 bg-page px-4 pb-4 pt-6 transition-[transform,border-color,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-white/10 hover:bg-[#141312]"
                    {...motionBlockProps}
                    transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
                  >
                    <div>
                      {item.excerpt ? <p className="text-base leading-relaxed text-body">{item.excerpt}</p> : null}
                      {item.stack?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.stack.map((tag, tagIndex) => (
                            <span
                              key={tag.id ?? tagIndex}
                              className="rounded-full border border-[#757571] bg-main px-4 py-1 text-xs font-normal text-cream"
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
                        <span className="text-2xl font-bold tracking-[-0.05em]">{item.name}</span>
                      </div>
                    ) : null}
                  </Motion>
                )
              })}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
