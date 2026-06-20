import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Scale, ScaleShowcaseBlock } from '@/payload-types'
import { Building2, Landmark, Rocket, ShieldCheck, TrendingUp } from 'lucide-react'
import type { JSX } from 'react'

/**
 * Scale showcase (design node 1459:5723 et al, elevated).
 *
 * One section per engagement tier. The design's figure/ground: the tier HEADER (pill + display
 * heading + description + meta) sits on the page background, and only the structured content
 * lives inside a Surface/Card (#1b1a17) data panel — followed by a divider and a Descriptions
 * row of term/value pairs. The CMS schema currently exposes a tags string + a podSize array
 * rather than the design's bespoke per-tier data viz (sprint log / Gantt / procurement timeline),
 * so this renders those fields as a structured capability grid + metric row inside the data card;
 * see sharedNeeds for the schema work needed to land the full per-tier panels.
 *
 * Reveals use the shared <Motion> wrapper (honors prefers-reduced-motion); hover is pure Tailwind.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Per-tier icon, cycled by index so each tier reads with its own glyph rather than a single
// repeated Building2. Order tracks the typical tier sequence startup → scale → enterprise → gov.
const TIER_ICONS = [Rocket, TrendingUp, Building2, ShieldCheck, Landmark]

export function ScaleShowcaseComponent(props: ScaleShowcaseBlock): JSX.Element {
  const scales = (props.scales as Scale[] | null | undefined)?.filter(Boolean) ?? []

  if (scales.length === 0) return <></>

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 lg:gap-28">
      {scales.map((item, scaleIndex) => {
        const tagsList = item.tags
          ? item.tags
              .split(/[•,|]/)
              .map((tag) => tag.trim())
              .filter(Boolean)
          : []
        const metrics = (item.podSize ?? []).filter((m) => m?.value || m?.title)
        const TierIcon = TIER_ICONS[scaleIndex % TIER_ICONS.length]
        const hasPanelContent = tagsList.length > 0 || metrics.length > 0

        return (
          <Motion
            key={item.id ?? `scale-${scaleIndex}`}
            tag="section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex w-full flex-col"
          >
            {/* Header — sits on the page background */}
            <div className="flex max-w-3xl flex-col items-start text-left">
              {item.subTitle && (
                <span className="mb-6 inline-block rounded-full border border-subtle bg-main px-4 py-1.5 text-[18px] leading-none text-cream">
                  {item.subTitle}
                </span>
              )}

              {item.title && (
                <h2 className="font-display max-w-2xl text-[clamp(1.6rem,3.4vw,1.875rem)] font-medium leading-[1.15] tracking-[-0.045em] text-cream">
                  {item.title}
                </h2>
              )}

              {item.description && (
                <RichTextComp
                  content={item.description as RichText}
                  className="prose-sm mt-5 max-w-2xl text-[15px] leading-[1.5] text-body lg:text-[16px]"
                />
              )}

              {tagsList.length > 0 && (
                <div className="mt-5 flex items-center gap-2 text-[12px] tracking-[-0.01em] text-subtle">
                  <TierIcon size={14} strokeWidth={1.75} aria-hidden className="shrink-0" />
                  <span className="leading-none">{tagsList.join(' · ')}</span>
                </div>
              )}
            </div>

            {/* Data card — the only carded surface, per design */}
            {hasPanelContent && (
              <div className="mt-8 w-full rounded-md bg-main ring-1 ring-white/5">
                {tagsList.length > 0 && (
                  <div className="p-6 lg:p-8">
                    <span className="text-[12px] tracking-[-0.01em] text-subtle">How we show up</span>
                    <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                      {tagsList.map((tag, idx) => (
                        <li
                          key={`${item.id ?? scaleIndex}-tag-${idx}`}
                          className="group flex items-start gap-3 border-t border-white/10 pt-4"
                        >
                          <span className="mt-px text-[12px] tabular-nums leading-none text-subtle">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[14px] font-medium capitalize leading-[1.3] tracking-[-0.01em] text-cream transition-colors duration-300 group-hover:text-cream">
                            {tag}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Descriptions row — term caption + large display value */}
                {metrics.length > 0 && (
                  <div
                    className={`grid grid-cols-1 border-t border-white/10 ${
                      metrics.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                    }`}
                  >
                    {metrics.map((metric, idx) => (
                      <div
                        key={metric.id ?? `${item.id ?? scaleIndex}-metric-${idx}`}
                        className={`flex flex-col gap-2 p-6 lg:p-8 ${
                          idx > 0 ? 'border-t border-white/10 sm:border-t-0 sm:border-l' : ''
                        }`}
                      >
                        {metric.title && (
                          <span className="text-[12px] tracking-[-0.01em] text-subtle">{metric.title}</span>
                        )}
                        {metric.value && (
                          <span className="font-display text-[18px] font-medium leading-[1.25] tracking-[-0.02em] text-cream lg:text-[20px]">
                            {metric.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Motion>
        )
      })}
    </div>
  )
}
