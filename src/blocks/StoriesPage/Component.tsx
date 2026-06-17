import Motion from '@/components/animation/motion'
import AllStoriesGrid, { type StoryGridItem } from '@/components/sections/stories/AllStoriesGrid'
import SubscribeForm from '@/components/sections/stories/SubscribeForm'
import type { Media, PressRelease, StoriesPageBlock, Story } from '@/payload-types'
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  FileText,
  FlaskConical,
  Lightbulb,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

const CATEGORY_LANDING_ICONS = {
  newspaper: Newspaper,
  'flask-conical': FlaskConical,
  lightbulb: Lightbulb,
  'file-text': FileText,
} as const satisfies Record<string, LucideIcon>

type CategoryLandingIconKey = keyof typeof CATEGORY_LANDING_ICONS

const CATEGORY_GRADIENTS = [
  'bg-linear-to-br from-[#1a3d6b] via-[#1e5f7a] to-[#2a9aad]',
  'bg-linear-to-br from-[#3a1f66] via-[#5a2d8a] to-[#7a3fb8]',
  'bg-linear-to-br from-[#0d3d32] via-[#1a5c48] to-[#2a9a6a]',
  'bg-linear-to-br from-[#4a1848] via-[#7a2d58] to-[#c43d68]',
] as const

function CategoryLandingIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || !(icon in CATEGORY_LANDING_ICONS)) return null
  const Icon = CATEGORY_LANDING_ICONS[icon as CategoryLandingIconKey]
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-white" />
}

export const StoriesPageComponent = (data: StoriesPageBlock): JSX.Element => {
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

  const featuredStory = data.featureCaseStudy?.story as Story | undefined
  const featuredImage = featuredStory?.thumbnail as Media | undefined
  const gridItems = data.allStoriesGrid?.items as StoryGridItem[] | undefined
  const pressReleases = data.allStoriesGrid?.pressRelease as PressRelease[] | undefined

  return (
    <div className="flex flex-col lg:gap-32 gap-10">
      {/* Hero */}
      <Motion tag="section" className="w-full lg:pt-16 lg:pb-8 pt-8 pb-4" {...motionSectionProps}>
        <div className="w-full mx-auto flex flex-col px-4 lg:px-0 items-center justify-center">
          <Motion className="flex flex-col text-center max-w-4xl" {...motionBlockProps}>
            <h1 className="lg:text-4xl text-3xl font-medium tracking-tight mb-6 max-w-3xl leading-[1.15]">
              {data.heroSection?.heading}
            </h1>
            <p className="lg:text-base text-sm text-[#D5D5D5] max-w-2xl">{data.heroSection?.description}</p>
          </Motion>
        </div>
      </Motion>

      {/* Feature Case Study */}
      {featuredStory && (
        <Motion tag="section" className="w-full lg:m-0 m-4 space-y-8" {...motionSectionProps}>
          {(data.featureCaseStudy?.heading || data.featureCaseStudy?.description) && (
            <div className="space-y-3 max-w-3xl">
              {data.featureCaseStudy?.heading && (
                <h2 className="lg:text-3xl text-2xl font-medium tracking-tight text-white">
                  {data.featureCaseStudy.heading}
                </h2>
              )}
              {data.featureCaseStudy?.description && (
                <p className="lg:text-sm text-xs text-[#D5D5D5] leading-relaxed">{data.featureCaseStudy.description}</p>
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

              {data.featureCaseStudy?.stats && data.featureCaseStudy.stats.length > 0 && (
                <div className="absolute bottom-6 right-6 flex gap-3">
                  {data.featureCaseStudy.stats.map((stat, index) => (
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

              {data.featureCaseStudy?.highlights && data.featureCaseStudy.highlights.length > 0 && (
                <ul className="space-y-3">
                  {data.featureCaseStudy.highlights.map((highlight, index) => (
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
                  {data.featureCaseStudy?.readTime && (
                    <>
                      <Clock size={12} />
                      <span>{data.featureCaseStudy.readTime}</span>
                    </>
                  )}
                  {data.featureCaseStudy?.categoryLabel && <span>· {data.featureCaseStudy.categoryLabel}</span>}
                </div>

                <Link
                  href={featuredStory.slug ? `/stories/${featuredStory.slug}` : '#'}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4F3EC] text-[#0F0E0E] font-medium text-sm hover:bg-[#E8E7DF] transition-colors"
                >
                  {data.featureCaseStudy?.buttonLabel || 'Read case study'}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Motion>
      )}

      {/* All Stories Grid */}
      <Motion tag="section" {...motionSectionProps}>
        <AllStoriesGrid
          heading={data.allStoriesGrid?.heading}
          description={data.allStoriesGrid?.description}
          items={gridItems}
          pressReleases={pressReleases}
        />
      </Motion>

      {/* Category Landing */}
      {data.categoryLanding?.categories && data.categoryLanding.categories.length > 0 && (
        <Motion tag="section" className="w-full lg:m-0 m-4 space-y-8" {...motionSectionProps}>
          <div className="space-y-3 max-w-3xl">
            {data.categoryLanding.heading && (
              <h2 className="lg:text-3xl text-2xl font-medium tracking-tight text-white">
                {data.categoryLanding.heading}
              </h2>
            )}
            {data.categoryLanding.description && (
              <p className="lg:text-sm text-xs text-[#D5D5D5] leading-relaxed">{data.categoryLanding.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.categoryLanding.categories.map((category, index) => {
              const image = category.image as Media | undefined
              const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]

              const content = (
                <Motion
                  className="relative rounded-lg overflow-hidden h-[360px] lg:h-[440px] flex flex-col justify-end p-8 group"
                  initial={{ opacity: 0, scale: 0.985 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.35 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
                >
                  {image?.url ? (
                    <>
                      <Image
                        src={image.url}
                        alt={image.alt || category.title || 'Category'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 ${gradient}`} />
                  )}

                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 contrast-150 mix-blend-overlay pointer-events-none" />

                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mb-5">
                      <CategoryLandingIcon icon={category.icon} />
                    </div>

                    <div className="space-y-3">
                      {category.title && (
                        <h3 className="text-2xl lg:text-[28px] font-medium tracking-tight text-white leading-tight">
                          {category.title}
                        </h3>
                      )}
                      {category.description && (
                        <p className="text-sm text-white/75 leading-relaxed line-clamp-2">{category.description}</p>
                      )}
                      {category.link && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-white/90 pt-1 group-hover:text-white transition-colors">
                          {category.linkLabel || 'Open section'}
                          <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
                        </span>
                      )}
                    </div>
                  </div>
                </Motion>
              )

              return category.link ? (
                <Link key={category.id ?? `category-${index}`} href={category.link} className="block">
                  {content}
                </Link>
              ) : (
                <div key={category.id ?? `category-${index}`}>{content}</div>
              )
            })}
          </div>
        </Motion>
      )}

      {/* Subscribe */}
      {data.subscribe?.heading && (
        <Motion
          tag="section"
          className="lg:m-0 m-4 rounded-lg overflow-hidden border border-zinc-800/40 bg-main"
          {...motionSectionProps}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
            <div className="p-8 lg:p-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl lg:text-4xl font-medium tracking-tight text-white leading-tight max-w-lg">
                  {data.subscribe.heading}
                </h2>
                {data.subscribe.description && (
                  <p className="text-sm text-[#D5D5D5] leading-relaxed max-w-xl">{data.subscribe.description}</p>
                )}
              </div>

              {data.subscribe.followOptions && data.subscribe.followOptions.length > 0 && (
                <div className="space-y-3">
                  {data.subscribe.followHint && <p className="text-xs text-[#757571]">{data.subscribe.followHint}</p>}
                  <div className="flex flex-wrap gap-2">
                    {data.subscribe.followOptions.map((option, index) => (
                      <button
                        key={option.id ?? `follow-${index}`}
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs border border-zinc-700/60 text-[#D5D5D5] hover:border-zinc-600 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <SubscribeForm
                emailPlaceholder={data.subscribe.emailPlaceholder}
                buttonLabel={data.subscribe.buttonLabel}
              />

              {data.subscribe.disclaimer && <p className="text-xs text-[#757571]">{data.subscribe.disclaimer}</p>}
            </div>

            <div
              className="relative min-h-[280px] lg:min-h-full p-8 flex flex-col justify-between"
              style={{
                background: (data.subscribe.preview?.backgroundImage as Media)?.url
                  ? `url(${(data.subscribe.preview?.backgroundImage as Media)?.url}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 space-y-8 text-white">
                {data.subscribe.preview?.issueLabel && (
                  <p className="text-xs text-white/70">{data.subscribe.preview.issueLabel}</p>
                )}

                <div className="space-y-4">
                  {data.subscribe.preview?.heading && (
                    <p className="text-sm font-medium">{data.subscribe.preview.heading}</p>
                  )}
                  {data.subscribe.preview?.items && data.subscribe.preview.items.length > 0 && (
                    <ul className="space-y-2">
                      {data.subscribe.preview.items.map((item, index) => (
                        <li
                          key={item.id ?? `preview-${index}`}
                          className="flex items-start gap-2 text-sm text-white/90"
                        >
                          <span>→</span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-white/70 pt-4">
                  <span>{data.subscribe.preview?.subscribersLabel}</span>
                  <span>{data.subscribe.preview?.readTimeLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </Motion>
      )}
    </div>
  )
}

export default StoriesPageComponent
