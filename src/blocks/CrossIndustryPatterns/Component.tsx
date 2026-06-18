import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { CrossIndustryPatternsBlock, Media } from '@/payload-types'
import { Smile, Zap } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

export function CrossIndustryPatternsComponent(props: CrossIndustryPatternsBlock): JSX.Element | null {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const motionBlockProps = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.4 as const },
    transition: { duration: 0.35, ease: 'easeOut' as const },
  }

  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  if (!props?.heading) return null

  return (
    <Motion tag="section" className="bg-main p-10 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
      <div className="space-y-8 lg:space-y-10">
        <Motion className="space-y-3" {...motionBlockProps}>
          <h2 className="lg:text-3xl text-2xl font-semibold tracking-tight text-white">{props.heading}</h2>
          {props.description && (
            <p className="lg:text-sm text-xs text-[#D5D5D5] max-w-3xl leading-relaxed">{props.description}</p>
          )}
        </Motion>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {props.items?.map((item, index) => {
            const imageUrl = item.media ? ((item.media as Media)?.url ?? undefined) : undefined
            const isFirst = index === 0
            const isLast = index === (props.items?.length ?? 0) - 1 && index > 0

            return (
              <Motion
                key={item.id ?? `pattern-${index}`}
                className={cn(
                  'relative overflow-hidden rounded-lg p-6 lg:p-8 flex flex-col min-h-[240px]',
                  !isFirst && 'bg-[#0F0E0E]',
                  isFirst && 'lg:col-span-2 lg:row-span-2 lg:min-h-[520px] justify-end',
                  isFirst && !imageUrl && 'bg-[#0F0E0E]',
                  !isFirst && !isLast && 'lg:col-start-3 justify-between',
                  index === 1 && 'lg:row-start-1',
                  index === 2 && 'lg:row-start-2',
                  isLast && 'lg:col-span-3 lg:col-start-1 lg:row-start-3 lg:min-h-[180px] justify-between',
                )}
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                {isFirst && imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={imageUrl}
                      alt={item.title || 'Pattern background'}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
                  </div>
                )}

                {!isFirst && (
                  <div className="relative z-10 shrink-0">
                    {isLast ? (
                      <Zap size={16} className="text-[#757571] stroke-[2]" aria-hidden />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center text-[#757571]">
                        <Zap size={14} className="stroke-[2.5]" aria-hidden />
                      </div>
                    )}
                  </div>
                )}

                <div className={cn('relative z-10 space-y-2 shrink-0', isFirst ? 'max-w-xl' : 'max-w-2xl mt-auto')}>
                  {isFirst && (
                    <div className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white mb-2">
                      <Smile size={16} strokeWidth={1.75} aria-hidden />
                    </div>
                  )}
                  {item.title && (
                    <h3 className="text-lg lg:text-xl font-medium tracking-tight text-white">{item.title}</h3>
                  )}
                  {item.excerpt && <p className="text-sm text-[#D5D5D5] leading-relaxed">{item.excerpt}</p>}
                </div>
              </Motion>
            )
          })}
        </div>
      </div>
    </Motion>
  )
}
