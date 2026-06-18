import Motion from '@/components/animation/motion'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutThesisBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export function AboutThesisComponent({ heading, description, items }: AboutThesisBlock): JSX.Element | null {
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
                >
                  {isSixth ? (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 hidden lg:block">
                      <div className="absolute inset-0 rounded-full border border-white/10 border-dashed animate-[spin_20s_linear_infinite]"></div>
                      <div className="absolute inset-4 rounded-full border border-white/20 animate-[spin_12s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-5 rounded-full border border-white/25 animate-ping animation-duration-[2.4s]"></div>
                      <div className="absolute inset-5 rounded-full border border-white/20 animate-ping animation-duration-[2.4s] [animation-delay:0.8s]"></div>
                      <div className="absolute inset-5 rounded-full border border-white/15 animate-ping animation-duration-[2.4s] [animation-delay:1.6s]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-[ping_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </BentoCard>
              </Motion>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
