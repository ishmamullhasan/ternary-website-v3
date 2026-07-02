import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import GradientAvatar from '@/components/sections/insights/GradientAvatar'
import GradientPanel from '@/components/sections/insights/GradientPanel'
import InsightShare from '@/components/sections/insights/InsightShare'
import InsightToc from '@/components/sections/insights/InsightToc'
import JsonLd from '@/components/seo/JsonLd'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { article, breadcrumbList } from '@/lib/seo/jsonLd'
import type { Insight, Media, Team } from '@/payload-types'
import config from '@/payload.config'
import { extractHeadings } from '@/utilities/extractHeadings'
import { getServerSideURL } from '@/utilities/getURL'
import { ArrowLeft, ArrowRight, ArrowUpRight, Linkedin, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG: prebuild known slugs (generateStaticParams below) and serve them statically. Freshness is
// purely tag-driven (no time-based revalidate) — the insight afterChange/afterDelete hooks bust
// the tags below. dynamicParams lets slugs not in the prebuilt set render on demand.
export const dynamicParams = true

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

async function fetchInsightBySlug(slug: string, locale: TypedLocale): Promise<Insight | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'insight',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Insight | undefined) ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('insight')` / `revalidateTag('insight_<slug>')` calls in the insight afterChange
// hook. In draft mode (live preview) we bypass the cache so editors see fresh data.
async function getInsightBySlug(slug: string, locale: TypedLocale): Promise<Insight | null> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchInsightBySlug(slug, locale)
  return unstable_cache(() => fetchInsightBySlug(slug, locale), [`insight_${slug}_${locale}`], {
    // `team`: the author byline embeds a team doc (depth 2), so editing that team member must bust
    // this page too.
    tags: [`insight_${slug}`, 'insight', 'team'],
  })()
}

export async function generateStaticParams() {
  const insights = await getInsightList()
  // Cross-product: one entry per {locale, slug}.
  return LOCALES.flatMap((locale) => insights.map((item) => ({ locale, slug: item.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const insight = await getInsightBySlug(slug, typedLocale)

  if (!insight) return {}

  return generateMeta({
    doc: insight,
    fallbackTitle: 'Insight',
    fallbackDescription: insight.excerpts,
    pathname: `/insights/${slug}`,
    locale: typedLocale,
    ogType: 'article',
  })
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.6, ease: EASE },
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

function MetaPair({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] text-subtle">{label}</span>
      <span className="text-[16px] text-cream">{value}</span>
    </div>
  )
}

function RelatedInsightCard({ item, index, locale }: { item: Insight; index: number; locale: TypedLocale }) {
  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
    >
      <Link
        href={`/${locale}/insights/${item.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-md bg-main ring-1 ring-white/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
      >
        {/* Signature gradient-noise media (no photo) — renders identically with or without CMS media. */}
        <GradientPanel tone="emerald" scrim radius="rounded-none" className="h-[224px]">
          <div className="flex h-full flex-col p-6">
            <span className="inline-flex w-fit items-center rounded-full bg-black/55 px-3.5 py-1.5 text-[13px] text-cream backdrop-blur-sm">
              {item.code || 'Insight'}
            </span>
            <div className="mt-auto flex items-center justify-between text-[12px] text-cream/90">
              <span>{item.categoryLabel ?? ''}</span>
              <span>{item.publishedDate ? formatShortDate(item.publishedDate) : ''}</span>
            </div>
          </div>
        </GradientPanel>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="font-display text-[20px] font-medium leading-[1.18] tracking-[-0.02em] text-cream line-clamp-3">
            {item.title}
          </h3>

          {item.excerpts && <p className="text-[15px] leading-relaxed text-body line-clamp-3">{item.excerpts}</p>}

          <div className="mt-auto flex items-center justify-between border-t border-subtle/60 pt-4 text-[12px]">
            <span className="text-body">{item.categoryLabel ?? 'Insight'}</span>
            <span className="flex items-center gap-1 text-[16px] text-cream transition-all group-hover:gap-2">
              Read <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </Motion>
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const insight = await getInsightBySlug(slug, typedLocale)

  if (!insight) {
    notFound()
  }

  const author = insight.author as Team | undefined
  const authorImage = author?.image as Media | undefined
  const tagNames = insight.tags?.map((tag) => tag.name).filter(Boolean) as string[] | undefined
  const relatedItems = (insight.relatedInsights?.insights as Insight[] | undefined)?.filter(
    (item) => item.id !== insight.id,
  )
  const headings = extractHeadings(insight.content as RichText)
  const baseUrl = getServerSideURL()
  const shareUrl = `${baseUrl}/${typedLocale}/insights/${slug}`
  const thumbnail = insight.thumbnail as Media | undefined

  const articleLd = article({
    headline: insight.title ?? 'Insight',
    description: insight.excerpts,
    image: thumbnail?.url ?? null,
    datePublished: insight.publishedDate,
    dateModified: insight.updatedAt,
    authorName: author?.name,
    url: shareUrl,
  })

  const breadcrumbsLd = breadcrumbList([
    { name: 'Home', url: `${baseUrl}/${typedLocale}` },
    { name: 'Stories', url: `${baseUrl}/${typedLocale}/stories` },
    { name: insight.title ?? 'Insight', url: shareUrl },
  ])

  const showAuthorMeta = Boolean(author?.name || author?.position)
  const showMetaRow = showAuthorMeta || insight.publishedDate || insight.readTime || insight.slug
  const authorEmail = `mailto:hello@ternary.solutions`

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 pb-16 lg:gap-[72px] lg:pb-24">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbsLd} />

      {/* Breadcrumb / utility bar */}
      <div className="flex items-center justify-between gap-4 pt-8 lg:pt-12">
        <Link
          href={`/${typedLocale}/stories`}
          className="group inline-flex items-center gap-2 rounded-sm text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          All insights
        </Link>
        {insight.categoryLabel && <span className="text-[14px] text-subtle">{insight.categoryLabel}</span>}
      </div>

      {/* Hero — left text column + signature gradient-noise panel (no photo) */}
      <Motion tag="section" {...reveal}>
        <div className="grid grid-cols-1 items-stretch gap-8 overflow-hidden rounded-lg lg:grid-cols-[576px_1fr] lg:gap-[72px] lg:px-6">
          <div className="flex min-h-[392px] flex-col justify-between gap-10">
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-3xl font-medium leading-[1.15] text-cream opacity-90 lg:text-[40px]">
                {insight.title}
              </h1>

              {insight.leadParagraph && (
                <RichTextComp
                  content={insight.leadParagraph as RichText}
                  className="max-w-xl [&_p]:text-[16px] [&_p]:leading-[1.15] [&_p]:text-body"
                />
              )}
            </div>

            {showMetaRow && (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                {showAuthorMeta && (
                  <div className="flex items-center gap-3">
                    <GradientAvatar image={authorImage} name={author?.name} size={40} />
                    <div className="min-w-0">
                      {author?.name && <p className="truncate text-[16px] text-cream">{author.name}</p>}
                      {author?.position && <p className="truncate text-[12px] text-subtle">{author.position}</p>}
                    </div>
                  </div>
                )}

                <MetaPair label="Published" value={insight.publishedDate ? formatDate(insight.publishedDate) : null} />
                <MetaPair label="Read time" value={insight.readTime} />
                <MetaPair label="Slug" value={insight.slug} />
              </div>
            )}
          </div>

          <GradientPanel tone="emerald" radius="rounded-lg" className="h-[280px] w-full lg:h-[392px]" />
        </div>
      </Motion>

      {/* Article body */}
      {(insight.content || tagNames?.length || author) && (
        <Motion tag="section" {...reveal}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[278px_1fr] lg:gap-8">
            <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
              {headings.length > 0 && <InsightToc headings={headings} />}
              <InsightShare url={shareUrl} title={insight.title} />
            </aside>

            <div className="flex min-w-0 flex-col gap-8">
              {insight.content && (
                <RichTextComp
                  content={insight.content as RichText}
                  className="flex flex-col gap-2 [&_blockquote]:border-l-2 [&_blockquote]:border-cream/40 [&_blockquote]:pl-4 [&_blockquote]:text-body [&_code]:block [&_code]:overflow-x-auto [&_code]:rounded-md [&_code]:border [&_code]:border-line [&_code]:bg-ink [&_code]:p-6 [&_code]:font-mono [&_code]:text-[14px] [&_code]:leading-relaxed [&_code]:text-body [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-[-0.05em] [&_h2]:text-cream [&_h2]:lg:text-[30px] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-24 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-medium [&_h3]:tracking-[-0.05em] [&_h3]:text-cream [&_h3]:lg:text-2xl [&_li]:text-body [&_p]:mt-0 [&_p]:text-[16px] [&_p]:leading-[1.8] [&_p]:tracking-normal [&_p]:text-body [&_ul]:mt-2 [&_ul]:space-y-2"
                />
              )}

              {tagNames && tagNames.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tagNames.map((tag, index) => (
                    <span key={`tag-${index}`} className="rounded-full bg-badge px-4 py-1.5 text-[12px] text-cream">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author bio */}
              {author?.name && (
                <div className="flex flex-col gap-4 rounded-2xl bg-main p-6 sm:flex-row">
                  <GradientAvatar image={authorImage} name={author.name} size={58} />
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-subtle">Written by</span>
                      <p className="text-[16px] text-cream">{author.name}</p>
                      {author.position && <p className="text-[12px] text-subtle">{author.position}</p>}
                    </div>
                    {author.description && (
                      <RichTextComp
                        content={author.description as RichText}
                        className="prose-sm max-w-none text-[16px] leading-[1.8] tracking-normal text-body"
                      />
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      {author.linkedin && (
                        <a
                          href={author.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-sm text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                          aria-label={`${author.name} on LinkedIn`}
                        >
                          <Linkedin size={14} />
                          LinkedIn
                        </a>
                      )}
                      <a
                        href={authorEmail}
                        className="inline-flex items-center gap-1.5 rounded-sm text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                        aria-label="Email Ternary"
                      >
                        <Mail size={14} />
                        Email
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
        <Motion tag="section" {...reveal}>
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-cream lg:text-[28px]">
              {insight.relatedInsights?.heading || 'Related insights'}
            </h2>
            <Link
              href={`/${typedLocale}/stories`}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-sm text-[16px] text-body transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
            >
              All insights
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {insight.relatedInsights?.description && (
            <RichTextComp
              content={insight.relatedInsights.description as RichText}
              className="mb-8 max-w-3xl [&_p]:text-[16px] [&_p]:leading-relaxed [&_p]:text-body"
            />
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((item, index) => (
              <RelatedInsightCard key={item.id} item={item} index={index} locale={typedLocale} />
            ))}
          </div>
        </Motion>
      )}

      {/* CTA — local noise-gradient panel (no external image dependency) */}
      {insight.cta?.heading && (
        <Motion
          tag="section"
          {...reveal}
          className="relative overflow-hidden rounded-md p-6 ring-1 ring-white/5 lg:p-10"
        >
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(120% 130% at 16% 12%, #2f5ad8 0%, #4c1d95 52%, #1b1230 100%)',
            }}
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/45" />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-start text-left lg:max-w-xl">
              <h2 className="mb-3 font-display text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-cream md:text-3xl lg:text-4xl">
                {insight.cta.heading}
              </h2>
              {insight.cta.description && (
                <RichTextComp
                  content={insight.cta.description as RichText}
                  className="max-w-lg [&_p]:text-[14px] [&_p]:leading-relaxed [&_p]:text-body/85 md:[&_p]:text-[15px]"
                />
              )}
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:ml-auto">
              {insight.cta.button_1?.label && (
                <Link
                  href={insight.cta.button_1.link || '#'}
                  className="rounded-md bg-button-dark px-5 py-2.5 text-center text-[16px] font-medium text-cream transition-colors hover:bg-button-dark/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 sm:w-auto"
                >
                  {insight.cta.button_1.label}
                </Link>
              )}
              {insight.cta.button_2?.label && (
                <Link
                  href={insight.cta.button_2.link || '#'}
                  className="rounded-md bg-cream px-5 py-2.5 text-center text-[16px] font-medium text-ink transition-colors hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 sm:w-auto"
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
