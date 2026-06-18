import Motion from '@/components/animation/motion'
import type { Industry, IndustryPanelsBlock, Media } from '@/payload-types'
import { Building2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

export function IndustryPanelsComponent(props: IndustryPanelsBlock): JSX.Element {
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

  return (
    <>
      {props?.items?.map((panel, panelIndex) => {
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
    </>
  )
}
