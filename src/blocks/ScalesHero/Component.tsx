import Motion from '@/components/animation/motion'
import type { Media } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

// TODO: switch to ScalesHeroBlock after generate:types
// Local interface mirroring src/blocks/ScalesHero/config.ts until payload-types
// regenerates the generated `ScalesHeroBlock` type.
interface ScalesHeroBlock {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  items?:
    | {
        title: string
        excerpt?: string | null
        media?: (string | null) | Media
        id?: string | null
      }[]
    | null
  id?: string | null
  blockName?: string | null
  blockType?: 'scalesHero'
}

export function ScalesHeroComponent(props: ScalesHeroBlock): JSX.Element {
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

  /** Careers hero image panel: scale + opacity in view */
  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <Motion tag="section" className="w-full lg:pt-16 lg:pb-8 pt-8 pb-4" {...motionSectionProps}>
      <div className="w-full mx-auto flex flex-col px-4 lg:px-0">
        {/* Header Block */}
        <Motion className="flex flex-col items-start text-left max-w-4xl" {...motionBlockProps}>
          {props?.eyebrow && (
            <span className="text-[10px] text-[#D5D5D5] tracking-wider mb-3 uppercase">{props.eyebrow}</span>
          )}
          <h1 className="lg:text-4xl text-3xl font-medium tracking-tight mb-6 max-w-2xl leading-[1.15]">
            {props?.heading}
          </h1>
          <p className="lg:text-base text-sm text-[#D5D5D5] max-w-xl">{props?.description}</p>
        </Motion>

        {/* Hero cards — layout perfectly aligned with the screenshot */}
        {props?.items && props?.items.length > 0 && (
          <div className="grid rounded-lg grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:pt-10 pt-4 w-full mt-6">
            {props?.items.map((item, index) => (
              <Motion
                key={item.id ?? `hero-card-${index}`}
                className="bg-[#0F0E0E] p-6 flex flex-col justify-between"
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                {/* Top Text Content Container */}
                <div className="flex flex-col items-start mb-8">
                  {/* Card Index (e.g., 01) */}
                  <span className="text-[10px] text-[#D5D5D5]  tracking-wider mb-3">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {/* Card Title */}
                  <h3 className="lg:text-sm text-xs font-medium tracking-tight ">{item.title}</h3>
                </div>

                {/* Card Image Block */}
                {(item.media as Media)?.url && (
                  <div className="relative w-full h-[140px] overflow-hidden">
                    <Image
                      src={(item.media as Media)?.url || ''}
                      alt={item.title || 'Scale image'}
                      fill
                      className="object-cover"
                      sizes="(max-w-7xl) 33vw, 100vw"
                    />
                  </div>
                )}
              </Motion>
            ))}
          </div>
        )}
      </div>
    </Motion>
  )
}
