import Motion from '@/components/animation/motion'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutThesisBlock, Media } from '@/payload-types'
import { Zap } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Icon + title + desc unit (design "Benefit block"). A 48px round `bg-page` icon badge
 * (24px lucide glyph), a 32px gap to the text group, then an 8px gap title→description. Title is
 * Poppins Medium 24 (Display/Subsection) at 90% opacity; description Inter 16 at 75% opacity. Each
 * cell sits on its own `bg-main` card (5px radius, 24px padding), matching the comp.
 */
function BenefitBlock({ title, desc }: { title?: string; desc?: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-end gap-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <Zap aria-hidden className="h-6 w-6 text-cream" />
      </div>
      <div className="flex flex-col gap-2">
        {title ? (
          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream/90">{title}</h3>
        ) : null}
        {desc ? <p className="text-base leading-tight tracking-[-0.02em] text-body/75">{desc}</p> : null}
      </div>
    </div>
  )
}

/**
 * Decorative editor chip floated over the featured photo cell (design node 1255:2839). A small
 * `bg-page` card with the three traffic-light dots and a two-line Consolas snippet at 70% opacity —
 * purely ornamental, so it's hidden on the narrow single-column layout and marked aria-hidden.
 */
function CodeChip(): JSX.Element {
  return (
    <div
      aria-hidden
      className="absolute right-[5%] top-[54%] z-10 hidden w-[215px] -translate-y-1/2 flex-col gap-2 rounded-xl border-[0.8px] border-cream/50 bg-page px-4 py-4 shadow-[0px_20px_12.5px_rgba(0,0,0,0.1),0px_8px_5px_rgba(0,0,0,0.1)] sm:flex"
    >
      <div className="flex gap-2">
        <span className="h-2 w-2 rounded-full bg-[#fb2c36]" />
        <span className="h-2 w-2 rounded-full bg-[#f0b100]" />
        <span className="h-2 w-2 rounded-full bg-[#00c950]" />
      </div>
      <pre className="font-mono text-[10px] leading-[15px] text-cream/70">
        <code>{'const agent = new Orchestrator();\nawait agent.execute(task);'}</code>
      </pre>
    </div>
  )
}

/**
 * Signature media layer for the featured bento cell (design node 1255:2837). A grayscale photo
 * occupies the right portion of the card (≈58% on md+, full-width on mobile) under the brand grain
 * overlay (`/noise.svg`); a left→right gradient dissolves the photo into the `bg-main` card on its
 * left edge so the benefit text reads cleanly over solid card colour. Sits at z-0 behind the cell's
 * `relative z-10` text. When no media is available (local S3 unavailable), it degrades to a warm
 * azure gradient + grain instead of an empty box.
 */
function BentoMedia({ url, alt }: { url?: string; alt?: string }): JSX.Element {
  return (
    <div aria-hidden className="absolute inset-y-0 right-0 z-0 w-full overflow-hidden md:w-[58%]">
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
            backgroundImage: 'radial-gradient(135% 135% at 78% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
          }}
        />
      )}
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
      {/* Photo dissolves into the card on its left edge (Figma 1255:2838 left→right fade). */}
      <span className="absolute inset-0 bg-gradient-to-r from-main via-main/60 to-transparent" />
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
        <div className="grid auto-rows-[360px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {isFirst ? (
                  // Featured media cell: grain photo surface with the benefit overlaid bottom-left.
                  <div className="group relative h-full min-h-[360px] overflow-hidden rounded-md bg-main">
                    <BentoMedia url={imageUrl} alt={item.title ?? undefined} />
                    <CodeChip />
                    <div className="relative z-10 flex h-full flex-col justify-end gap-8 p-6 lg:p-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
                        <Zap aria-hidden className="h-6 w-6 text-cream" />
                      </div>
                      <div className="flex flex-col gap-2">
                        {item.title ? (
                          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream/90">
                            {item.title}
                          </h3>
                        ) : null}
                        {item.excerpt ? (
                          <p className="max-w-sm text-base leading-tight tracking-[-0.02em] text-body/75">
                            {item.excerpt}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-full min-h-[360px] overflow-hidden rounded-md bg-main p-6">
                    <BenefitBlock title={item.title ?? undefined} desc={item.excerpt ?? undefined} />
                    {isSixth ? (
                      <div
                        aria-hidden
                        className="absolute right-8 top-1/3 z-0 hidden h-32 w-32 -translate-y-1/2 lg:block"
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
