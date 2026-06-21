import Motion from '@/components/animation/motion'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutBeliefsBlock, Media } from '@/payload-types'
import { Zap } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Transparent icon + title + desc unit (design "Benefit block"): a 48px round `bg-page` icon badge,
 * a 32px gap to the text group, then 8px title→desc. Title Poppins Medium 24, desc Inter 16 at 90%.
 */
function BenefitBlock({ title, desc }: { title?: string; desc?: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-end gap-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <Zap aria-hidden className="h-6 w-6 text-cream" />
      </div>
      <div className="flex flex-col gap-2">
        {title ? (
          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">{title}</h3>
        ) : null}
        {desc ? <p className="text-base leading-snug text-body/90">{desc}</p> : null}
      </div>
    </div>
  )
}

/**
 * Signature media layer for the featured belief cell (design node 1258:11841). Grayscale photo
 * under the brand grain (`/noise.svg`) + a left-to-right scrim so the icon/title hold legibility,
 * matching the comp where the first "What We Believe" tile carries a desaturated team photo on its
 * right half. Degrades to a violet brand gradient when media is unavailable.
 */
function BentoMedia({ url, alt }: { url?: string; alt?: string }): JSX.Element {
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt ?? ''}
          className="absolute inset-0 h-full w-full scale-105 object-cover grayscale transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
      ) : (
        <span
          className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          style={{
            backgroundImage: 'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
          }}
        />
      )}
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
      <span className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
    </div>
  )
}

export function AboutBeliefsComponent({ heading, description, items }: AboutBeliefsBlock): JSX.Element | null {
  const motionGridItemProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' as const },
  }

  if (!heading || !items?.length) return null

  return (
    <div>
      <Section title={heading ?? ''} desc={description ?? ''}>
        <div className="grid auto-rows-[360px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const imageUrl = item.media ? ((item.media as Media)?.url ?? undefined) : undefined
            const isFirst = index === 0
            const cardClass = isFirst ? 'md:col-span-2' : ''

            return (
              <Motion
                key={item.id ?? `belief-${index}`}
                className={cn('h-full min-h-0', cardClass)}
                {...motionGridItemProps}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              >
                {isFirst ? (
                  // Wide featured media cell with the belief overlaid bottom-left.
                  <div className="group relative h-full min-h-[360px] overflow-hidden rounded-md">
                    <BentoMedia url={imageUrl} alt={item.title ?? undefined} />
                    <div className="relative z-10 flex h-full flex-col justify-end gap-8 p-6 lg:p-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
                        <Zap aria-hidden className="h-6 w-6 text-cream" />
                      </div>
                      <div className="flex flex-col gap-2">
                        {item.title ? (
                          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">
                            {item.title}
                          </h3>
                        ) : null}
                        {item.excerpt ? (
                          <p className="max-w-md text-base leading-snug text-body/90">{item.excerpt}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[360px] px-6 lg:px-8">
                    <BenefitBlock title={item.title ?? undefined} desc={item.excerpt ?? undefined} />
                  </div>
                )}
              </Motion>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
