import Motion from '@/components/animation/motion'
import type { FeatureCaseStudyBlock, Media, Story } from '@/payload-types'
import { ArrowRight, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

export const FeatureCaseStudyComponent = (data: FeatureCaseStudyBlock): JSX.Element | null => {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const featuredStory = data.story as Story | undefined
  const featuredImage = featuredStory?.thumbnail as Media | undefined

  if (!featuredStory) return null

  return (
    <Motion tag="section" className="w-full lg:m-0 m-4 space-y-8" {...motionSectionProps}>
      {(data.heading || data.description) && (
        <div className="space-y-3 max-w-3xl">
          {data.heading && (
            <h2 className="lg:text-3xl text-2xl font-medium tracking-tight text-white">{data.heading}</h2>
          )}
          {data.description && (
            <p className="lg:text-sm text-xs text-[#D5D5D5] leading-relaxed">{data.description}</p>
          )}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-zinc-800/40 bg-main">
        <div className="relative w-full h-[280px] lg:h-[440px]">
          {featuredImage?.url ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt || featuredStory.title || 'Featured case study'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1280px"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-tr from-[#f3535b] via-[#5c1c49] to-[#f9a655] opacity-90" />
          )}

          {data.stats && data.stats.length > 0 && (
            <div className="absolute bottom-6 right-6 flex gap-3">
              {data.stats.map((stat, index) => (
                <div
                  key={stat.id ?? `stat-${index}`}
                  className="rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 px-4 py-3 text-center min-w-[120px]"
                >
                  <p className="text-2xl font-medium text-white">{stat.value}</p>
                  <p className="text-xs text-[#D5D5D5]">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl lg:text-3xl font-medium tracking-tight text-white leading-tight">
              {featuredStory.title}
            </h3>
            {featuredStory.excerpts && (
              <p className="text-sm lg:text-base text-[#D5D5D5] leading-relaxed max-w-2xl">
                {featuredStory.excerpts}
              </p>
            )}
          </div>

          {data.highlights && data.highlights.length > 0 && (
            <ul className="space-y-3">
              {data.highlights.map((highlight, index) => (
                <li
                  key={highlight.id ?? `highlight-${index}`}
                  className="flex items-start gap-3 text-sm text-[#D5D5D5]"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#757571] shrink-0" />
                  <span>{highlight.text}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-zinc-800/60">
            <div className="flex items-center gap-2 text-xs text-[#757571]">
              {data.readTime && (
                <>
                  <Clock size={12} />
                  <span>{data.readTime}</span>
                </>
              )}
              {data.categoryLabel && <span>· {data.categoryLabel}</span>}
            </div>

            <Link
              href={featuredStory.slug ? `/stories/${featuredStory.slug}` : '#'}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4F3EC] text-[#0F0E0E] font-medium text-sm hover:bg-[#E8E7DF] transition-colors"
            >
              {data.buttonLabel || 'Read case study'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </Motion>
  )
}

export default FeatureCaseStudyComponent
