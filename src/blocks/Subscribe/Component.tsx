import Motion from '@/components/animation/motion'
import { TONE } from '@/components/layout/GradientPanel'
import RichTextComp, { type RichText } from '@/components/richtext'
import SubscribeForm from '@/components/sections/stories/SubscribeForm'
import type { Media, SubscribeBlock } from '@/payload-types'
import type { JSX } from 'react'

export const SubscribeComponent = (data: SubscribeBlock): JSX.Element | null => {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  if (!data.heading) return null

  return (
    <Motion
      tag="section"
      className="lg:m-0 m-4 rounded-md overflow-hidden border border-line bg-main"
      {...motionSectionProps}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <div className="p-8 lg:p-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-4xl font-medium tracking-tight text-cream leading-tight max-w-lg">
              {data.heading}
            </h2>
            {data.description && (
              <RichTextComp
                content={data.description as RichText}
                className="max-w-xl prose-p:mb-0 prose-p:text-sm prose-p:text-body prose-p:leading-relaxed"
              />
            )}
          </div>

          {data.followOptions && data.followOptions.length > 0 && (
            <div className="space-y-3">
              {data.followHint && <p className="text-xs text-subtle">{data.followHint}</p>}
              <div className="flex flex-wrap gap-2">
                {data.followOptions.map((option, index) => (
                  <button
                    key={option.id ?? `follow-${index}`}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs border border-line text-body hover:border-line-strong transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <SubscribeForm emailPlaceholder={data.emailPlaceholder} buttonLabel={data.buttonLabel} />

          {data.disclaimer && <p className="text-xs text-subtle">{data.disclaimer}</p>}
        </div>

        <div
          className="relative min-h-[280px] lg:min-h-full p-8 flex flex-col justify-between"
          style={{
            background: (data.preview?.backgroundImage as Media)?.url
              ? `url(${(data.preview?.backgroundImage as Media)?.url}) center/cover no-repeat`
              : TONE.violet,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 space-y-8 text-white">
            {data.preview?.issueLabel && <p className="text-xs text-white/70">{data.preview.issueLabel}</p>}

            <div className="space-y-4">
              {data.preview?.heading && <p className="text-sm font-medium">{data.preview.heading}</p>}
              {data.preview?.items && data.preview.items.length > 0 && (
                <ul className="space-y-2">
                  {data.preview.items.map((item, index) => (
                    <li key={item.id ?? `preview-${index}`} className="flex items-start gap-2 text-sm text-white/90">
                      <span>→</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-white/70 pt-4">
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
