import Motion from '@/components/animation/motion'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutBeliefsBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export function AboutBeliefsComponent({ heading, description, items }: AboutBeliefsBlock): JSX.Element | null {
  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  if (!heading) return null

  return (
    <div className="lg:p-0 p-4">
      <Section title={heading ?? ''} desc={description ?? ''}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
          {items?.map((item, index) => {
            const imageUrl = item.media ? ((item.media as Media)?.url ?? undefined) : undefined
            const isFirst = index === 0
            const isSixth = index === 5
            const cardClass = [isFirst ? 'md:col-span-2 row-span-1' : '', isSixth ? 'md:col-span-2 relative' : '']
              .filter(Boolean)
              .join(' ')

            return (
              <Motion
                key={item.id ?? `thesis-${index}`}
                className={cn('min-h-0 h-full', cardClass)}
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                <BentoCard
                  animated={false}
                  className="h-full min-h-[240px]"
                  title={item.title ?? undefined}
                  desc={item.excerpt ?? undefined}
                  imageBg={isFirst ? imageUrl : undefined}
                ></BentoCard>
              </Motion>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
