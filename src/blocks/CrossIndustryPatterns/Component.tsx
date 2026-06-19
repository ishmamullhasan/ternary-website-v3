import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { CrossIndustryPatternsBlock, Media } from '@/payload-types'
import { GitBranch, Layers, Network, Workflow, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Distinct per-tile glyphs so the grid reads as different patterns rather than the repeated bolt.
const TILE_ICONS: readonly LucideIcon[] = [Layers, Network, GitBranch, Workflow]

export function CrossIndustryPatternsComponent(props: CrossIndustryPatternsBlock): JSX.Element | null {
  if (!props?.heading) return null

  const items = props.items ?? []

  return (
    <section className="w-full rounded-md bg-ink p-6 lg:p-10">
      <div className="space-y-8 lg:space-y-12">
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-3xl space-y-3"
        >
          <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-cream lg:text-3xl">
            {props.heading}
          </h2>
          {props.description && <p className="text-sm leading-relaxed text-body">{props.description}</p>}
        </Motion>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {items.map((item, index) => {
            const imageUrl = item.media ? ((item.media as Media)?.url ?? undefined) : undefined
            const isFirst = index === 0
            const isLast = index === items.length - 1 && index > 0
            const Icon = TILE_ICONS[index % TILE_ICONS.length]

            return (
              <Motion
                key={item.id ?? `pattern-${index}`}
                tag="div"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.4) }}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-md bg-main p-6 ring-1 ring-white/5 transition-colors duration-300 hover:ring-white/10 lg:p-8',
                  isFirst && 'justify-end lg:col-span-2 lg:row-span-2 lg:min-h-[480px]',
                  !isFirst && !isLast && 'justify-between lg:col-start-3 lg:min-h-[232px]',
                  index === 1 && 'lg:row-start-1',
                  index === 2 && 'lg:row-start-2',
                  isLast && 'justify-between lg:col-span-3 lg:col-start-1 lg:row-start-3 lg:min-h-[160px]',
                )}
              >
                {/* Feature tile: image when present, otherwise the signature noise-gradient field. */}
                {isFirst && (
                  <div aria-hidden className="absolute inset-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <>
                        <span
                          className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                          style={{
                            backgroundImage:
                              'radial-gradient(130% 130% at 20% 14%, #4f6bed 0%, #25307e 46%, #0c1030 100%)',
                          }}
                        />
                        <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
                      </>
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  </div>
                )}

                {!isFirst && (
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-cream/75 transition-colors duration-300 group-hover:text-cream">
                    <Icon size={16} strokeWidth={1.75} aria-hidden />
                  </span>
                )}

                <div className={cn('relative z-10 mt-auto space-y-2', isFirst ? 'max-w-xl' : 'max-w-md')}>
                  {item.title && (
                    <h3 className="font-display text-lg font-medium leading-tight tracking-tight text-cream lg:text-xl">
                      {item.title}
                    </h3>
                  )}
                  {item.excerpt && <p className="text-sm leading-relaxed text-body">{item.excerpt}</p>}
                </div>
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
