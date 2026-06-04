import Motion from '@/components/animation/motion'
import type { Media, ScalesPage } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Activity, BookCheck, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

export const dynamic = 'force-dynamic'

const QUALITY_BAR_ICONS = {
  activity: Activity,
  'shield-check': ShieldCheck,
  workflow: Workflow,
  'book-check': BookCheck,
} as const satisfies Record<string, LucideIcon>

type QualityBarIconKey = keyof typeof QUALITY_BAR_ICONS

function QualityBarIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || !(icon in QUALITY_BAR_ICONS)) return null
  const Icon = QUALITY_BAR_ICONS[icon as QualityBarIconKey]
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-white/80" />
}

export default async function Page(): Promise<JSX.Element> {
  let scalesData: ScalesPage | null = null
  try {
    scalesData = (await getCachedGlobal('scalesPage', 2)()) as ScalesPage | null
  } catch {
    // Database may be unavailable during build
  }

  if (!scalesData) {
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

  /** Careers hero image panel: scale + opacity in view */
  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <div className="flex flex-col lg:gap-32 gap-10 text-primary max-w-7xl mx-auto w-full lg:pb-24 pb-10">
      <Motion tag="section" className="w-full text-white lg:pt-16 lg:pb-8 pt-8 pb-4" {...motionSectionProps}>
        <div className="w-full mx-auto flex flex-col px-4 lg:px-0">
          {/* Header Block */}
          <Motion className="flex flex-col items-start text-left max-w-4xl" {...motionBlockProps}>
            <h1 className="lg:text-5xl text-3xl font-medium tracking-tight mb-6 max-w-2xl leading-[1.15]">
              {scalesData?.heroSection?.heading}
            </h1>
            <p className="lg:text-sm text-xs text-[#9a9a9a] max-w-xl leading-relaxed font-normal">
              {scalesData?.heroSection?.description}
            </p>
          </Motion>

          {/* Hero cards — layout perfectly aligned with the screenshot */}
          {scalesData?.heroSection?.items && scalesData?.heroSection?.items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:pt-10 pt-4 w-full mt-6">
              {scalesData?.heroSection?.items.map((item, index) => (
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
                    <span className="text-[10px] text-[#9a9a9a] font-mono tracking-wider mb-3">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {/* Card Title */}
                    <h3 className="lg:text-base text-sm font-medium tracking-tight text-white">{item.title}</h3>
                  </div>

                  {/* Card Image Block */}
                  {(item.image as Media)?.url && (
                    <div className="relative w-full h-[140px] overflow-hidden">
                      <Image
                        src={(item.image as Media)?.url || ''}
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

      <Motion tag="section" className="bg-main lg:p-10 p-4 rounded-lg lg:m-0 m-4 text-white" {...motionSectionProps}>
        {/* Structured Content Grid Layout (Matching image_42113f.png blueprint) */}
        <div className="flex flex-col lg:flex-row w-full">
          <div className="w-2/8  lg:pl-8  mb-6">
            <h2 className="lg:text-3xl text-2xl font-semibold mb-3 tracking-tight max-w-xl leading-tight">
              {scalesData?.qualityBar?.heading}
            </h2>
            <p className="lg:text-sm text-xs text-[#D5D5D5] max-w-2xl leading-relaxed">
              {scalesData?.qualityBar?.description}
            </p>
          </div>

          {/* 4-column card grid containing elements configured via Payload CMS schemas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:w-6/8 lg:pl-8">
            {scalesData?.qualityBar?.items?.map((item, index) => {
              return (
                <Motion
                  key={item.id ?? `scale-${index}`}
                  className="bg-[#0F0E0E] p-6 rounded-md flex flex-col justify-start min-h-[280px]"
                  {...motionGridItemProps}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: index * 0.05,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-6 border border-white/[0.05]">
                    <QualityBarIcon icon={item.icon} />
                  </div>

                  {/* Text Layout Metadata */}
                  <h3 className="lg:text-lg text-base font-medium mb-3 tracking-wide text-white">{item.title}</h3>

                  <p className="lg:text-xs text-[11px] text-[#A0A0A0] leading-relaxed font-normal">{item.excerpt}</p>
                </Motion>
              )
            })}
          </div>
        </div>
      </Motion>

      {/* CTA Section */}
      <Motion
        tag="section"
        className="lg:p-14 p-6 rounded-xl overflow-hidden lg:m-0 m-4 relative border border-white/[0.04]"
        style={{
          background: (scalesData?.cta?.backgroundImage as Media)?.url
            ? `url(${(scalesData?.cta?.backgroundImage as Media)?.url}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)', // Fallback matching image_4c91c8.jpg
        }}
        {...motionSectionProps}
      >
        {/* Grain/Texture Overlay Effect (Optional simulation matching the texture in image_4c91c8.jpg) */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=10')] bg-repeat" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 max-w-6xl mx-auto">
          {/* Left Side: Typography */}
          <Motion className="flex flex-col items-start text-left lg:max-w-xl" {...motionBlockProps}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-3 text-white leading-[1.2]">
              {scalesData?.cta?.heading}
            </h2>
            <p className="text-xs md:text-sm text-[#D5D5D5]/80 max-w-lg leading-relaxed">
              {scalesData?.cta?.description}
            </p>
          </Motion>

          {/* Right Side: Action Buttons */}
          <div className="flex sm:flex-row flex-col gap-3 items-center shrink-0 lg:ml-auto">
            {scalesData?.cta?.button_1?.label && (
              <Link
                href={scalesData?.cta?.button_1?.link as string}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#14120B] font-medium rounded-2xl text-base"
              >
                {scalesData?.cta?.button_1?.label}
              </Link>
            )}
            {scalesData?.cta?.button_2?.label && (
              <Link
                href={scalesData?.cta?.button_2?.link as string}
                className="px-8 py-3 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-2xl text-base"
              >
                {scalesData?.cta?.button_2?.label}
              </Link>
            )}
          </div>
        </div>
      </Motion>
    </div>
  )
}
