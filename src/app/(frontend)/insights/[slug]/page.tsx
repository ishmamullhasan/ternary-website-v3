import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import InsightShare from '@/components/sections/insights/InsightShare'
import type { Insight, Media, Team } from '@/payload-types'
import config from '@/payload.config'
import { extractHeadings } from '@/utilities/extractHeadings'
import { getServerSideURL } from '@/utilities/getURL'
import { ArrowRight, ArrowUpRight, Linkedin, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'

const getInsightList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'insight',
      limit: 100,
      depth: 0,
    })
    return result.docs
  },
  ['insight'],
  { tags: ['insight'] },
)

function getInsightBySlug(slug: string) {
  return unstable_cache(
    async (): Promise<Insight | null> => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'insight',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      })
      return (result.docs[0] as Insight | undefined) ?? null
    },
    [`insight_${slug}`],
    { tags: [`insight_${slug}`, 'insight'] },
  )
}

export async function generateStaticParams() {
  const insights = await getInsightList()
  return insights.map((item) => ({
    slug: item.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const insight = await getInsightBySlug(slug)()

  if (!insight) return {}

  return {
    title: insight.title ? `${insight.title} | Ternary Solutions` : 'Insight | Ternary Solutions',
    description: insight.leadParagraph || insight.excerpts || undefined,
  }
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

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

function formatDate(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShortDate(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function MetaColumn({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#757571]">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  )
}

function AuthorAvatar({ image, name }: { image?: Media; name?: string | null }) {
  if (image?.url) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
        <Image src={image.url} alt={image.alt || name || 'Author'} fill className="object-cover" sizes="40px" />
      </div>
    )
  }

  return <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500" />
}

function RelatedInsightCard({ item, index }: { item: Insight; index: number }) {
  const thumbnail = item.thumbnail as Media | undefined

  return (
    <Motion {...motionGridItemProps} transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}>
      <Link
        href={`/insights/${item.slug}`}
        className="group flex flex-col rounded-lg overflow-hidden border border-zinc-800/40 h-full"
      >
        <div className="relative h-[220px] overflow-hidden">
          {thumbnail?.url ? (
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt || item.title || 'Insight'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-teal-950 via-emerald-800 to-green-500" />
          )}

          <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-black/70 px-3 py-1 text-xs text-white">
            Insight
          </span>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
            <span>{item.code ?? ''}</span>
            <span>{item.publishedDate ? formatShortDate(item.publishedDate) : ''}</span>
          </div>
        </div>

        <div className="bg-[#0F0E0E] p-6 flex flex-col flex-1 gap-3">
          <h3 className="text-base font-medium tracking-tight text-white leading-snug line-clamp-3">{item.title}</h3>

          {item.excerpts && <p className="text-sm text-[#D5D5D5] leading-relaxed line-clamp-3">{item.excerpts}</p>}

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-zinc-800/60 text-xs">
            <span className="text-[#757571]">{item.categoryLabel ?? ''}</span>
            <span className="flex items-center gap-1 text-sm text-white group-hover:gap-2 transition-all">
              Read <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </Motion>
  )
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const insight = await getInsightBySlug(slug)()

  if (!insight) {
    notFound()
  }

  const thumbnail = insight.thumbnail as Media | undefined
  const author = insight.author as Team | undefined
  const authorImage = author?.image as Media | undefined
  const tagNames = insight.tags?.map((tag) => tag.name).filter(Boolean) as string[] | undefined
  const relatedItems = (insight.relatedInsights?.insights as Insight[] | undefined)?.filter(
    (item) => item.id !== insight.id,
  )
  const headings = extractHeadings(insight.content as RichText)
  const shareUrl = `${getServerSideURL()}/insights/${slug}`

  const showAuthorMeta = Boolean(author?.name || author?.position)
  const showMetaRow = showAuthorMeta || insight.publishedDate || insight.readTime || insight.slug

  return (
    <div className="flex flex-col lg:gap-24 gap-12 text-primary max-w-7xl mx-auto w-full lg:pb-24 pb-10">
      {/* Hero */}
      <Motion tag="section" className="w-full lg:pt-16 pt-8 px-4 lg:px-0" {...motionSectionProps}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <Motion className="flex flex-col justify-between gap-10 lg:min-h-[458px]" {...motionBlockProps}>
            <div className="flex flex-col gap-6">
              <h1 className="lg:text-5xl text-3xl font-medium tracking-tight leading-[1.1] text-white">
                {insight.title}
              </h1>

              {insight.leadParagraph && (
                <p className="text-base text-[#D5D5D5] leading-relaxed max-w-xl">{insight.leadParagraph}</p>
              )}
            </div>

            {showMetaRow && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-zinc-800/60">
                {showAuthorMeta && (
                  <div className="col-span-2 lg:col-span-1 flex items-center gap-3">
                    <AuthorAvatar image={authorImage} name={author?.name} />
                    <div className="min-w-0">
                      {author?.name && <p className="text-sm font-medium text-white truncate">{author.name}</p>}
                      {author?.position && <p className="text-xs text-[#757571] truncate">{author.position}</p>}
                    </div>
                  </div>
                )}

                <MetaColumn
                  label="Published"
                  value={insight.publishedDate ? formatDate(insight.publishedDate) : null}
                />
                <MetaColumn label="Read time" value={insight.readTime} />
                <MetaColumn label="Slug" value={insight.slug} />
              </div>
            )}
          </Motion>

          <Motion
            className="relative w-full h-[280px] lg:h-[458px] rounded-3xl overflow-hidden"
            {...motionGridItemProps}
          >
            {thumbnail?.url ? (
              <Image
                src={thumbnail.url}
                alt={thumbnail.alt || insight.title || 'Insight hero'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-teal-950 via-emerald-900 to-green-600" />
            )}
          </Motion>
        </div>
      </Motion>

      {/* Article body */}
      {(insight.content || tagNames?.length || author) && (
        <Motion tag="section" className="w-full px-4 lg:px-0" {...motionSectionProps}>
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
            <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-8">
              {headings.length > 0 && (
                <nav>
                  <p className="text-xs text-[#757571] mb-4">On this page</p>
                  <ul className="flex flex-col gap-2">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="text-sm text-[#757571] hover:text-white transition-colors leading-snug"
                        >
                          {heading.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <InsightShare url={shareUrl} title={insight.title} />
            </aside>

            <div className="flex flex-col gap-10 min-w-0">
              {insight.content && (
                <RichTextComp
                  content={insight.content as RichText}
                  className="flex flex-col gap-2 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_p]:text-base [&_p]:text-[#D5D5D5] [&_p]:leading-[1.7] [&_p]:mt-0 [&_h2]:text-2xl [&_h2]:lg:text-3xl [&_h2]:font-medium [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:mt-2 [&_ul]:space-y-2 [&_li]:text-[#D5D5D5] [&_code]:block [&_code]:bg-[#1B1A17] [&_code]:border [&_code]:border-zinc-800/60 [&_code]:rounded-lg [&_code]:p-4 [&_code]:text-sm [&_code]:text-[#D5D5D5] [&_code]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-violet-500 [&_blockquote]:pl-4 [&_blockquote]:text-[#D5D5D5]"
                />
              )}

              {tagNames && tagNames.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {tagNames.map((tag, index) => (
                    <span
                      key={`tag-${index}`}
                      className="text-xs border border-[#757571] px-4 py-1.5 rounded-full text-[#F4F3EC]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {author?.name && (
                <div className="bg-[#1B1A17] rounded-lg p-6 flex flex-col sm:flex-row gap-5">
                  <AuthorAvatar image={authorImage} name={author.name} />
                  <div className="flex flex-col gap-3 min-w-0">
                    <div>
                      <p className="text-sm text-[#757571]">
                        Written by <span className="text-white font-medium">{author.name}</span>
                        {author.position ? `, ${author.position}` : ''}
                      </p>
                    </div>
                    {author.description && (
                      <p className="text-sm text-[#D5D5D5] leading-relaxed">{author.description}</p>
                    )}
                    <div className="flex items-center gap-4 pt-1">
                      {author.linkedin && (
                        <a
                          href={author.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#757571] hover:text-white transition-colors"
                          aria-label={`${author.name} on LinkedIn`}
                        >
                          <Linkedin size={16} />
                        </a>
                      )}
                      <a
                        href="mailto:hello@ternary.studio"
                        className="text-[#757571] hover:text-white transition-colors"
                        aria-label="Email Ternary"
                      >
                        <Mail size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Motion>
      )}

      {/* Related insights */}
      {relatedItems && relatedItems.length > 0 && (
        <Motion tag="section" className="w-full px-4 lg:px-0" {...motionSectionProps}>
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="lg:text-3xl text-2xl font-medium tracking-tight text-white">
              {insight.relatedInsights?.heading || 'Related insights'}
            </h2>
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-sm text-[#D5D5D5] hover:text-white transition-colors shrink-0"
            >
              All Insights
              <ArrowRight size={14} />
            </Link>
          </div>

          {insight.relatedInsights?.description && (
            <p className="text-base text-[#D5D5D5] leading-relaxed mb-8 max-w-3xl">
              {insight.relatedInsights.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedItems.map((item, index) => (
              <RelatedInsightCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </Motion>
      )}

      {/* CTA */}
      {insight.cta?.heading && (
        <Motion
          tag="section"
          className="lg:p-10 p-6 rounded-lg overflow-hidden lg:mx-0 mx-4 relative border border-white/[0.04]"
          style={{
            background: (insight.cta.backgroundImage as Media)?.url
              ? `url(${(insight.cta.backgroundImage as Media)?.url}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1e3a5f 0%, #4c1d95 60%, #2e1065 100%)',
          }}
          {...motionSectionProps}
        >
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=10')] bg-repeat" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 max-w-6xl mx-auto">
            <Motion className="flex flex-col items-start text-left lg:max-w-xl" {...motionBlockProps}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-3 text-white leading-[1.2]">
                {insight.cta.heading}
              </h2>
              {insight.cta.description && (
                <p className="text-xs md:text-sm text-[#D5D5D5]/80 max-w-lg leading-relaxed">
                  {insight.cta.description}
                </p>
              )}
            </Motion>

            <div className="flex sm:flex-row flex-col gap-3 items-center shrink-0 lg:ml-auto">
              {insight.cta.button_1?.label && (
                <Link
                  href={insight.cta.button_1.link || '#'}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#14120B] font-medium rounded-2xl text-base text-center"
                >
                  {insight.cta.button_1.label}
                </Link>
              )}
              {insight.cta.button_2?.label && (
                <Link
                  href={insight.cta.button_2.link || '#'}
                  className="px-5 sm:w-auto w-full py-2.5 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-2xl text-base text-center"
                >
                  {insight.cta.button_2.label}
                </Link>
              )}
            </div>
          </div>
        </Motion>
      )}
    </div>
  )
}
