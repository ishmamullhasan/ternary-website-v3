import Motion from '@/components/animation/motion'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutBeliefsBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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
        <div className="grid auto-rows-[240px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <BentoCard
                  animated={false}
                  className="h-full min-h-[240px]"
                  title={item.title ?? undefined}
                  desc={item.excerpt ?? undefined}
                >
                  {isFirst ? <BentoMedia url={imageUrl} alt={item.title ?? undefined} /> : null}
                </BentoCard>
              </Motion>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
