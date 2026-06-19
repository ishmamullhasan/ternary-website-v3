import Motion from '@/components/animation/motion'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutApproachBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * "The Ternary Way" (design node 1259:12848): an image-led composition where a tall grayscale
 * photo card anchors the left (the headline benefit overlaid bottom-left), with a stack of plain
 * icon+title+desc benefit cells filling the rest of the 3-column grid. The first cell carries the
 * signature grain media; when media is unavailable it degrades to an emerald brand gradient.
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
            backgroundImage: 'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)',
          }}
        />
      )}
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
      <span className="absolute inset-0 bg-gradient-to-t from-[#0f0e0e] via-[#0f0e0e]/45 to-transparent" />
    </div>
  )
}

export function AboutApproachComponent({ heading, description, items }: AboutApproachBlock): JSX.Element | null {
  const motionGridItemProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' as const },
  }

  if (!heading || !items?.length) return null

  return (
    <div>
      <Section title={heading ?? ''} desc={description ?? ''}>
        <div className="grid auto-rows-[240px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const imageUrl = item.media ? ((item.media as Media)?.url ?? undefined) : undefined
            const isFirst = index === 0
            const cardClass = isFirst ? 'md:col-span-2 md:row-span-2' : ''

            return (
              <Motion
                key={item.id ?? `approach-${index}`}
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
