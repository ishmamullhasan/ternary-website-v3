import Motion from '@/components/animation/motion'
import type { AboutProofOfScaleBlock } from '@/payload-types'
import { Box } from 'lucide-react'
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
              <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-cream lg:text-3xl">{heading}</h2>
            ) : null}
            {description ? <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">{description}</p> : null}
          </Motion>

          {stats?.length ? (
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:mt-14 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <Motion
                  key={stat.id ?? i}
                  {...motionBlockProps}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.06, 0.4) }}
                >
                  <div className="font-display text-5xl font-medium leading-none tracking-[-0.02em] text-cream lg:text-[64px]">
                    {stat.value}
                  </div>
                  <div className="mt-3 text-[15px] font-medium text-body lg:text-base">{stat.label}</div>
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
              <h2 className="max-w-xl font-display text-2xl font-medium leading-[1.15] tracking-[-0.01em] text-cream lg:text-3xl">
                {company.heading}
              </h2>
            ) : null}
            {company?.description ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-body">{company.description}</p>
            ) : null}
          </Motion>

          {company?.items?.length ? (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
              {company.items.map((item, index) => (
                <Motion
                  key={item.id ?? index}
                  className="group flex h-full min-h-[200px] flex-col justify-between rounded-md border border-white/5 bg-ink p-5 transition-[transform,border-color,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-white/10 hover:bg-[#141312]"
                  {...motionBlockProps}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
                >
                  <div>
                    {item.excerpt ? <p className="text-[14px] leading-relaxed text-body">{item.excerpt}</p> : null}
                    {item.stack?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.stack.map((tag, tagIndex) => (
                          <span
                            key={tag.id ?? tagIndex}
                            className="rounded-full border border-subtle/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-subtle"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {item.name ? (
                    <div className="mt-8 flex items-center gap-2 text-cream">
                      <Box aria-hidden className="h-5 w-5 text-cream/80" />
                      <span className="text-[17px] font-medium tracking-[-0.01em]">{item.name}</span>
                    </div>
                  ) : null}
                </Motion>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
