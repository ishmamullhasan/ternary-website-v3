import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import SubscribeForm from '@/components/sections/stories/SubscribeForm'
import type { Media, SubscribeBlock } from '@/payload-types'
import { BookOpen, FileText, FlaskConical, Newspaper } from 'lucide-react'
import type { JSX } from 'react'

// The preview panel's signature gradient (Figma `1418:5117`): a warm→cool diagonal base with a
// magenta glow top-left and a violet glow lower-right. Used when no CMS background image is set.
const PREVIEW_GRADIENT =
  'radial-gradient(80% 80% at 20% 30%, rgba(232,48,171,0.7) 0%, rgba(232,48,171,0) 60%), ' +
  'radial-gradient(80% 80% at 80% 70%, rgba(140,54,226,0.7) 0%, rgba(140,54,226,0) 60%), ' +
  'linear-gradient(136.76deg, #571942 0%, #251547 100%)'

/** Map a follow-option label to its Figma pill icon; falls back to position for unknown labels. */
function followIcon(label?: string | null, index = 0): typeof FileText {
  const l = (label ?? '').toLowerCase()
  if (l.includes('case')) return FileText
  if (l.includes('press')) return Newspaper
  if (l.includes('thought') || l.includes('insight') || l.includes('piece')) return BookOpen
  if (l.includes('research')) return FlaskConical
  return [FileText, Newspaper, BookOpen, FlaskConical][index % 4]
}

export const SubscribeComponent = (data: SubscribeBlock): JSX.Element | null => {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  if (!data.heading) return null

  const backgroundUrl = (data.preview?.backgroundImage as Media)?.url

  return (
    <Motion tag="section" className="overflow-hidden rounded-lg border border-line bg-main" {...motionSectionProps}>
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Left: copy, follow pills, form, disclaimer. */}
        <div className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-8 lg:py-[72px]">
          <div className="flex flex-col gap-3">
            <h2 className="max-w-[483px] font-display text-[26px] font-medium leading-[1.15] tracking-[-0.05em] text-cream opacity-90 lg:text-[30px]">
              {data.heading}
            </h2>
            {data.description && (
              <RichTextComp
                content={data.description as RichText}
                className="max-w-[560px] opacity-90 prose-p:mb-0 prose-p:text-base prose-p:font-normal prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-body"
              />
            )}
          </div>

          {data.followOptions && data.followOptions.length > 0 && (
            <div className="flex flex-col gap-3">
              {data.followHint && (
                <p className="text-[12px] leading-[1.15] tracking-[-0.05em] text-body">{data.followHint}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {data.followOptions.map((option, index) => {
                  const Icon = followIcon(option.label, index)
                  return (
                    <button
                      key={option.id ?? `follow-${index}`}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-subtle bg-main px-4 py-2 text-[12px] leading-[1.15] tracking-[-0.05em] text-body transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                    >
                      <Icon size={12} aria-hidden className="shrink-0" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <SubscribeForm emailPlaceholder={data.emailPlaceholder} buttonLabel={data.buttonLabel} />

          {data.disclaimer && (
            <p className="max-w-[560px] text-base leading-[1.15] tracking-[-0.05em] text-body opacity-90">
              {data.disclaimer}
            </p>
          )}
        </div>

        {/* Right: "In the next issue" preview on the signature gradient. */}
        <div
          className="relative flex min-h-[360px] flex-col justify-between px-8 py-12 lg:w-[484px] lg:min-h-[444px]"
          style={{
            background: backgroundUrl ? `url(${backgroundUrl}) center/cover no-repeat` : PREVIEW_GRADIENT,
          }}
        >
          {backgroundUrl && <div className="absolute inset-0 bg-black/40" />}
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            {data.preview?.issueLabel && (
              <p className="text-[12px] leading-[1.15] tracking-[-0.05em] text-cream">{data.preview.issueLabel}</p>
            )}

            <div className="flex flex-col gap-3">
              {data.preview?.heading && (
                <p className="text-base font-medium leading-[1.15] tracking-[-0.05em] text-cream">
                  {data.preview.heading}
                </p>
              )}
              {data.preview?.items && data.preview.items.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {data.preview.items.map((item, index) => (
                    <li
                      key={item.id ?? `preview-${index}`}
                      className="flex items-start gap-2 text-base font-medium leading-[1.15] tracking-[-0.05em] text-cream"
                    >
                      <span aria-hidden>→</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between text-[12px] leading-[1.15] tracking-[-0.05em] text-cream">
              <span>{data.preview?.subscribersLabel}</span>
              <span>{data.preview?.readTimeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </Motion>
  )
}

export default SubscribeComponent
