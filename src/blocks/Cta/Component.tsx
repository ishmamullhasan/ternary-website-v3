import Motion from '@/components/animation/motion'
import type { CtaBlock, Media } from '@/payload-types'
import Link from 'next/link'
import type { JSX } from 'react'

/**
 * Design-faithful CTA banner — extracted verbatim from the marketing pages' CTA section
 * (gradient/background-image panel, left typography + right action buttons). Self-wraps in a
 * Motion section, so RenderBlocks renders it directly (see SELF_WRAPPED).
 */
export function CtaBlockComponent({ heading, description, backgroundImage, button_1, button_2 }: CtaBlock): JSX.Element {
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
    <Motion
      tag="section"
      className="lg:p-10 p-6 rounded-lg overflow-hidden lg:m-0 m-4 relative border border-white/[0.04]"
      style={{
        background: (backgroundImage as Media)?.url
          ? `url(${(backgroundImage as Media)?.url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)',
      }}
      {...motionSectionProps}
    >
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=10')] bg-repeat" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 max-w-6xl mx-auto">
        <Motion className="flex flex-col items-start text-left lg:max-w-xl" {...motionBlockProps}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-3 text-white leading-[1.2]">
            {heading}
          </h2>
          <p className="text-xs md:text-sm text-[#D5D5D5]/80 max-w-lg leading-relaxed">{description}</p>
        </Motion>

        <div className="flex sm:flex-row flex-col gap-3 items-center shrink-0 lg:ml-auto">
          {button_1?.label && (
            <Link
              href={button_1?.link as string}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#14120B] font-medium rounded-2xl text-base"
            >
              {button_1.label}
            </Link>
          )}
          {button_2?.label && (
            <Link
              href={button_2?.link as string}
              className="px-5 sm:w-auto w-full py-2.5 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-2xl text-base"
            >
              {button_2.label}
            </Link>
          )}
        </div>
      </div>
    </Motion>
  )
}
