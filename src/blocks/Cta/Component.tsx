import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { Button } from '@/components/ui/button'
import type { CtaBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

/**
 * Design-faithful CTA banner — extracted verbatim from the marketing pages' CTA section
 * (gradient/background-image panel, left typography + right action buttons). Self-wraps in a
 * Motion section, so RenderBlocks renders it directly (see SELF_WRAPPED).
 */
export function CtaBlockComponent({
  heading,
  description,
  backgroundImage,
  button_1,
  button_2,
}: CtaBlock): JSX.Element {
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
      className="relative overflow-hidden rounded-md border border-white/[0.04] p-6 lg:p-10"
      style={{
        background: (backgroundImage as Media)?.url
          ? `url(${(backgroundImage as Media)?.url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)',
      }}
      {...motionSectionProps}
    >
      {/* Local grain overlay (no external image dependency) — the signature noise texture. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('/noise.svg')] bg-[length:240px] bg-repeat"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <Motion className="flex flex-col items-start text-left lg:max-w-xl" {...motionBlockProps}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-3 text-cream leading-[1.2]">
            {heading}
          </h2>
          {description && (
            <RichTextComp
              content={description as RichText}
              className="max-w-lg prose-p:mb-0 prose-p:text-xs md:prose-p:text-sm prose-p:leading-relaxed prose-p:text-body/80"
            />
          )}
        </Motion>

        <div className="flex sm:flex-row flex-col gap-3 items-center shrink-0 lg:ml-auto">
          {button_1?.label && (
            <Button
              asChild
              className="w-full sm:w-auto px-5 py-2.5 h-auto bg-button-dark text-cream text-base hover:bg-button-dark/90"
            >
              <Link href={(button_1?.link as string) || '#'}>{button_1.label}</Link>
            </Button>
          )}
          {button_2?.label && (
            <Button
              asChild
              className="w-full sm:w-auto px-5 py-2.5 h-auto bg-cream text-ink text-base hover:bg-cream-hover"
            >
              <Link href={(button_2?.link as string) || '#'}>{button_2.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </Motion>
  )
}
