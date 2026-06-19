import Motion from '@/components/animation/motion'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutThesisBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Signature media layer for a featured bento cell (design node 1255:2829). A grayscale photo under
 * the brand grain overlay (`/noise.svg`) and a bottom scrim — the same texture device as the
 * homepage hero cards. Sits at z-0 behind the BentoCard's `relative z-10` text. When no media is
 * available (local S3 unavailable), it degrades to a warm azure gradient + grain instead of an
 * empty box.
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
            backgroundImage: 'radial-gradient(135% 135% at 22% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
          }}
        />
      )}
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
      <span className="absolute inset-0 bg-gradient-to-t from-[#0f0e0e] via-[#0f0e0e]/55 to-transparent" />
    </div>
  )
}

export function AboutThesisComponent({ heading, description, items }: AboutThesisBlock): JSX.Element | null {
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
            const isSixth = index === 5
            const cardClass = [isFirst ? 'md:col-span-2' : '', isSixth ? 'md:col-span-2 relative' : '']
              .filter(Boolean)
              .join(' ')

            return (
              <Motion
                key={item.id ?? `thesis-${index}`}
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
                  {isSixth ? (
                    <div
                      aria-hidden
                      className="absolute right-8 top-1/2 z-10 hidden h-32 w-32 -translate-y-1/2 lg:block"
                    >
                      <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-white/10"></div>
                      <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-white/20"></div>
                      <div className="animation-duration-[2.4s] absolute inset-5 animate-ping rounded-full border border-white/25"></div>
                      <div className="animation-duration-[2.4s] absolute inset-5 animate-ping rounded-full border border-white/20 [animation-delay:0.8s]"></div>
                      <div className="animation-duration-[2.4s] absolute inset-5 animate-ping rounded-full border border-white/15 [animation-delay:1.6s]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                          <div className="h-2 w-2 animate-[ping_2s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_10px_white]"></div>
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
