import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import { cn } from '@/lib/utils'
import type { IndustriesPage, Industry, Media } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Activity, Building2, Check, CheckCircle2, Lock, Smile, Zap, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

export const dynamic = 'force-dynamic'

const REGULATORY_POSTURE_ICONS = {
  lock: Lock,
  activity: Activity,
  check: Check,
} as const satisfies Record<string, LucideIcon>

type RegulatoryPostureIconKey = keyof typeof REGULATORY_POSTURE_ICONS

function RegulatoryPostureIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || !(icon in REGULATORY_POSTURE_ICONS)) return null
  const Icon = REGULATORY_POSTURE_ICONS[icon as RegulatoryPostureIconKey]
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-white/80" />
}

export default async function Page(): Promise<JSX.Element> {
  let industriesData: IndustriesPage | null = null
  try {
    industriesData = (await getCachedGlobal('industriesPage', 2)()) as IndustriesPage | null
  } catch {
    // Database may be unavailable during build
  }

  if (!industriesData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

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

  const industries = industriesData.industryList?.industry as Industry[] | undefined

  return (
    <div className="flex flex-col lg:gap-32 gap-10 text-primary max-w-7xl mx-auto w-full lg:pb-24 pb-10">
      {/* Hero */}
      <Motion tag="section" className="w-full lg:pt-16 lg:pb-8 pt-8 pb-4" {...motionSectionProps}>
        <div className="w-full mx-auto flex flex-col px-4 lg:px-0 items-center justify-center">
          <Motion className="flex flex-col text-center max-w-4xl" {...motionBlockProps}>
            <h1 className="lg:text-4xl text-3xl font-medium tracking-tight mb-6 max-w-2xl leading-[1.15]">
              {industriesData.heroSection?.heading}
            </h1>
            <p className="lg:text-base text-sm text-[#D5D5D5] max-w-xl">{industriesData.heroSection?.description}</p>
          </Motion>
        </div>
      </Motion>

      {/* Industry List */}
      <Motion tag="section" className="w-full py-16 lg:m-0 m-4" {...motionSectionProps}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {industries?.map((item, index) => (
            <Link href={`/industries`} key={item.id ?? index} className="group block">
              <Motion
                className="bg-[#1B1A17] hover:bg-[#252420] border border-zinc-800/40 rounded-lg p-6 lg:p-8 h-[320px] flex flex-col justify-end transition-colors duration-300"
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                <div className="flex flex-col space-y-6">
                  <div className="w-10 h-10 rounded-full bg-[#14120B] border border-zinc-800/60 flex items-center justify-center text-white/80 shadow-inner">
                    <Zap size={16} className="stroke-[2.5]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg lg:text-xl font-medium tracking-tight text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#D5D5D5] font-normal leading-relaxed line-clamp-4">
                      {item.excerpts ||
                        'Clear processes enable weekly releases and predictable continuous deployment, avoiding technical debt.'}
                    </p>
                  </div>
                </div>
              </Motion>
            </Link>
          ))}
        </div>
      </Motion>

      {/* Details */}
      {industriesData.details?.heading && (
        <Motion tag="section" className="bg-main lg:p-10 p-4 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <div className="flex lg:flex-row flex-col lg:items-start items-center lg:justify-between">
            <Motion className="lg:w-1/5" {...motionBlockProps}>
              <h3 className="lg:text-2xl text-xl mb-3 font-medium text-white">{industriesData.details.heading}</h3>
              <p className="lg:text-sm text-xs text-[#D5D5D5]">{industriesData.details.description}</p>
            </Motion>

            <Motion className="lg:pl-8 pl-0 lg:pt-0 pt-4 lg:w-4/5" {...motionBlockProps}>
              <RichTextComp content={industriesData.details.content as RichText} />
            </Motion>
          </div>
        </Motion>
      )}

      {/* Per-industry Panels */}
      {industriesData.perIndustryPanels?.items?.map((panel, panelIndex) => {
        const linkedIndustry = panel.industry as Industry | undefined
        const panelTitle = panel.title || linkedIndustry?.title
        const panelDescription = panel.description || linkedIndustry?.excerpts
        const panelImage = (panel.image as Media | undefined) || (linkedIndustry?.thumbnail as Media | undefined)
        const tags = panel.tags?.map((tag) => tag.name).filter(Boolean) ?? []

        return (
          <Motion
            key={panel.id ?? `panel-${panelIndex}`}
            tag="section"
            className="w-full bg-main p-10 rounded-lg lg:m-0 m-4"
            {...motionSectionProps}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
              <div className="flex flex-col justify-between space-y-8">
                <Motion className="flex flex-col items-start text-left" {...motionBlockProps}>
                  <div className="flex items-center gap-2 text-xs text-[#757571] tracking-wider font-medium mb-5">
                    <Building2 size={14} className="stroke-[1.75]" />
                    <span>
                      Industry {String(panelIndex + 1).padStart(2, '0')} / {linkedIndustry?.title || 'Sector'}
                    </span>
                  </div>

                  {panelTitle && (
                    <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-white mb-6 leading-tight max-w-lg">
                      {panelTitle}
                    </h2>
                  )}

                  {panelDescription && (
                    <p className="text-sm lg:text-base text-[#D5D5D5] font-normal leading-relaxed max-w-xl mb-6">
                      {panelDescription}
                    </p>
                  )}

                  <div className="w-full bg-[#0F0E0E] rounded-lg p-6 lg:p-8 space-y-6">
                    <div>
                      <h4 className="text-xs text-[#757571] tracking-wide font-medium mb-3">What we build</h4>
                      <p className="text-sm text-[#D5D5D5] leading-relaxed font-normal">
                        Trade execution paths, real-time risk engines, and surveillance hooks that evolve as a single
                        product — not siloed tools bolted onto a legacy core.
                      </p>
                    </div>

                    {tags.length > 0 && (
                      <ul className="space-y-3 pt-2">
                        {tags.map((tag, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-[#D5D5D5]">
                            <CheckCircle2 size={16} className="text-[#757571] shrink-0 mt-0.5 stroke-[1.5]" />
                            <span>{tag}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Motion>
              </div>

              <div className="relative w-full h-[300px] lg:h-auto min-h-[350px] rounded-lg overflow-hidden group">
                {panelImage?.url ? (
                  <Image
                    src={panelImage.url}
                    alt={panelImage.alt || panelTitle || 'Industry overview visual'}
                    priority={panelIndex === 0}
                    className="object-cover w-full h-full rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-tr from-[#f3535b] via-[#5c1c49] to-[#f9a655] rounded-lg opacity-90 saturate-125" />
                )}
              </div>
            </div>
          </Motion>
        )
      })}

      {/* Cross-industry Patterns */}
      {industriesData.crossIndustryPatterns?.heading && (
        <Motion tag="section" className="bg-main p-10 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <div className="space-y-8 lg:space-y-10">
            <Motion className="space-y-3" {...motionBlockProps}>
              <h2 className="lg:text-3xl text-2xl font-semibold tracking-tight text-white">
                {industriesData.crossIndustryPatterns.heading}
              </h2>
              {industriesData.crossIndustryPatterns.description && (
                <p className="lg:text-sm text-xs text-[#D5D5D5] max-w-3xl leading-relaxed">
                  {industriesData.crossIndustryPatterns.description}
                </p>
              )}
            </Motion>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {industriesData.crossIndustryPatterns.items?.map((item, index) => {
                const imageUrl = item.image ? ((item.image as Media)?.url ?? undefined) : undefined
                const isFirst = index === 0
                const isLast = index === (industriesData.crossIndustryPatterns?.items?.length ?? 0) - 1 && index > 0

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
      )}

      {/* Regulatory Posture */}
      {industriesData.regulatoryPosture?.heading && (
        <Motion tag="section" className="w-full py-16 lg:m-0 m-4" {...motionSectionProps}>
          <div className="flex flex-col space-y-10 w-full">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-normal tracking-tight text-white max-w-2xl leading-tight">
                {industriesData.regulatoryPosture.heading}
              </h2>
              {industriesData.regulatoryPosture.description && (
                <p className="lg:text-sm text-xs text-[#D5D5D5] max-w-4xl leading-relaxed">
                  {industriesData.regulatoryPosture.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {industriesData.regulatoryPosture.items?.map((item, index) => (
                <Motion
                  key={item.id ?? `regulatory-${index}`}
                  className="bg-main p-8 lg:p-10 rounded-lg flex flex-col justify-start min-h-[220px]"
                  {...motionGridItemProps}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: index * 0.05,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#0F0E0E] flex items-center justify-center mb-6 border border-white/[0.05]">
                    <RegulatoryPostureIcon icon={item.icon} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="lg:text-lg text-base font-medium tracking-wide text-white">{item.title}</h3>
                    <p className="lg:text-xs text-[11px] text-[#D5D5D5] leading-relaxed line-clamp-3">{item.excerpt}</p>
                  </div>
                </Motion>
              ))}
            </div>
          </div>
        </Motion>
      )}

      {/* CTA */}
      <Motion
        tag="section"
        className="lg:p-10 p-6 rounded-lg overflow-hidden lg:m-0 m-4 relative border border-white/[0.04]"
        style={{
          background: (industriesData.cta?.backgroundImage as Media)?.url
            ? `url(${(industriesData.cta?.backgroundImage as Media)?.url}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)',
        }}
        {...motionSectionProps}
      >
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=10')] bg-repeat" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 max-w-6xl mx-auto">
          <Motion className="flex flex-col items-start text-left lg:max-w-xl" {...motionBlockProps}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-3 text-white leading-[1.2]">
              {industriesData.cta?.heading}
            </h2>
            <p className="text-xs md:text-sm text-[#D5D5D5]/80 max-w-lg leading-relaxed">
              {industriesData.cta?.description}
            </p>
          </Motion>

          <div className="flex sm:flex-row flex-col gap-3 items-center shrink-0 lg:ml-auto">
            {industriesData.cta?.button_1?.label && (
              <Link
                href={industriesData.cta.button_1.link as string}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#14120B] font-medium rounded-2xl text-base"
              >
                {industriesData.cta.button_1.label}
              </Link>
            )}
            {industriesData.cta?.button_2?.label && (
              <Link
                href={industriesData.cta.button_2.link as string}
                className="px-5 sm:w-auto w-full py-2.5 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-2xl text-base"
              >
                {industriesData.cta.button_2.label}
              </Link>
            )}
          </div>
        </div>
      </Motion>
    </div>
  )
}
