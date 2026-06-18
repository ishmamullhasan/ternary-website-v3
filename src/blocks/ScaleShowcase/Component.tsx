import Motion from '@/components/animation/motion'
import type { Media, Scale, ScaleShowcaseBlock } from '@/payload-types'
import { Building2 } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

export function ScaleShowcaseComponent(props: ScaleShowcaseBlock): JSX.Element {
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
    <div className="flex flex-col lg:gap-32 gap-10">
      {(props.scales as Scale[])?.map((item, scaleIndex) => {
        const tagsList = item.tags
          ? item.tags
              .split(/[•,|]/)
              .map((tag) => tag.trim())
              .filter(Boolean)
          : []

        return (
          <Motion
            key={item.id ?? `scale-${scaleIndex}`}
            tag="section"
            className="w-full bg-[#1B1A17] p-10 rounded-lg flex justify-center"
            {...motionSectionProps}
          >
            <div className="w-full flex flex-col">
              <Motion className="flex flex-col items-start text-left mb-8" {...motionBlockProps}>
                {item.subTitle && (
                  <span className="inline-block border border-[#757571] text-lg  px-4 py-0.5 rounded-full text-[#d4d4d4] mb-6">
                    {item.subTitle}
                  </span>
                )}

                <h2 className="lg:text-3xl text-2xl font-medium tracking-tight mb-6 max-w-2xl leading-[1.15]">
                  {item.title}
                </h2>

                {item.description && <p className="text-base text-[#D5D5D5] max-w-2xl mb-4">{item.description}</p>}

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#757571]">
                  <span className="flex items-center gap-2">
                    <Building2 size={18} strokeWidth={1.75} aria-hidden className="shrink-0" />
                    {item.tags}
                  </span>
                </div>
              </Motion>

              {(item.image as Media)?.url && (
                <div className="w-full mb-4">
                  <div className="relative w-full lg:h-[200px] h-[150px]">
                    <Image
                      src={(item.image as Media).url || ''}
                      alt={(item.image as Media).alt || item.title || 'Scale graphic'}
                      priority={scaleIndex === 0}
                      className="object-contain object-center"
                      height={(item.image as Media).height || 200}
                      width={(item.image as Media).width || 1000}
                    />
                  </div>
                </div>
              )}

              <hr className="border-[#757571] w-full mt-8" />

              {item.podSize && item.podSize.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                  {item.podSize.map((metric, idx) => (
                    <div
                      key={metric.id ?? idx}
                      className={`flex flex-col gap-2 ${idx > 0 ? 'md:border-l md:border-[#757571] md:pl-4' : ''}`}
                    >
                      <span className="text-xs text-[#757571] pt-4 capitalize">{metric.title}</span>
                      <span className="text-xl lg:text-2xl font-medium text-white tracking-tight">{metric.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Motion>
        )
      })}
    </div>
  )
}
