import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { GradientPanel } from '@/components/sections/stories/gradient'
import type { FeatureCaseStudyBlock, Story } from '@/payload-types'
import { ArrowRight, Clock } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Accent greens cycle across the overlay stat tiles (design: #2dd280 / #26d9bb).
const STAT_ACCENTS = ['#2dd280', '#26d9bb']

export const FeatureCaseStudyComponent = (data: FeatureCaseStudyBlock): JSX.Element | null => {
  const featuredStory = data.story as Story | undefined
  if (!featuredStory) return null

  const stats = data.stats ?? []
  const highlights = data.highlights ?? []
  const href = featuredStory.slug ? `/case-studies/${featuredStory.slug}` : '#'

  return (
    <section className="w-full">
      {(data.heading || data.description) && (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-6 max-w-3xl space-y-3"
        >
          {data.heading && (
            <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-medium leading-[1.15] tracking-[-0.04em] text-cream">
              {data.heading}
            </h2>
          )}
          {data.description && (
            <RichTextComp
              content={data.description as RichText}
              className="prose-p:mb-0 prose-p:text-[15px] prose-p:leading-[1.55] prose-p:tracking-[-0.01em] prose-p:text-body lg:prose-p:text-base"
            />
          )}
        </Motion>
      )}

      <Motion
        tag="div"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="overflow-hidden rounded-md border border-white/5 bg-main"
      >
        {/* Signature green gradient panel — the gradient IS the artwork, never a photo. */}
        <div className="relative h-[280px] w-full lg:h-[440px]">
          <GradientPanel featured />

          {stats.length > 0 && (
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap justify-end gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.id ?? `stat-${index}`}
                  className="min-w-[110px] flex-1 rounded-[4px] border border-white/5 bg-main/90 p-4 text-center backdrop-blur-sm sm:flex-none"
                >
                  <p
                    className="font-display text-2xl font-medium tracking-[-0.04em] lg:text-[30px]"
                    style={{ color: STAT_ACCENTS[index % STAT_ACCENTS.length] }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12px] tracking-[-0.02em] text-cream">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.04em] text-cream lg:text-[30px]">
              {featuredStory.title}
            </h3>
            {featuredStory.excerpts && (
              <p className="max-w-2xl text-[15px] leading-[1.55] tracking-[-0.01em] text-body lg:text-base">
                {featuredStory.excerpts}
              </p>
            )}
          </div>

          {highlights.length > 0 && (
            <ul className="space-y-3">
              {highlights.map((highlight, index) => (
                <li
                  key={highlight.id ?? `highlight-${index}`}
                  className="flex items-start gap-3 text-[15px] leading-[1.45] tracking-[-0.01em] text-cream lg:text-base"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2dd280]" />
                  <span>{highlight.text}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-4 border-t border-subtle/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[12px] tracking-[-0.02em] text-body">
              {data.readTime && (
                <>
                  <Clock size={12} aria-hidden />
                  <span>{data.readTime}</span>
                </>
              )}
              {data.categoryLabel && <span>· {data.categoryLabel}</span>}
            </div>

            <Link
              href={href}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cream px-5 text-sm text-ink transition-colors hover:bg-cream-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {data.buttonLabel || 'Read Case Study'}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </Motion>
    </section>
  )
}

export default FeatureCaseStudyComponent
