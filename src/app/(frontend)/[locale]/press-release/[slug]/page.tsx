import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import JsonLd from '@/components/seo/JsonLd'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { article, breadcrumbList } from '@/lib/seo/jsonLd'
import type { Media, PressRelease } from '@/payload-types'
import config from '@/payload.config'
import { getServerSideURL } from '@/utilities/getURL'
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Download,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Tag,
} from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

const getPressReleaseList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pressRelease',
      limit: 100,
      depth: 0,
    })
    return result.docs
  },
  ['pressRelease'],
  { tags: ['pressRelease'] },
)

async function fetchPressReleaseBySlug(slug: string, locale: TypedLocale): Promise<PressRelease | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pressRelease',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as PressRelease | undefined) ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('pressRelease')` / `revalidateTag('pressRelease_<slug>')` calls in the pressRelease
// afterChange hook. In draft mode (live preview) we bypass the cache so editors see fresh data.
async function getPressReleaseBySlug(slug: string, locale: TypedLocale): Promise<PressRelease | null> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchPressReleaseBySlug(slug, locale)
  return unstable_cache(() => fetchPressReleaseBySlug(slug, locale), [`pressRelease_${slug}_${locale}`], {
    tags: [`pressRelease_${slug}`, 'pressRelease'],
  })()
}

export async function generateStaticParams() {
  const pressReleases = await getPressReleaseList()
  // Cross-product: one entry per {locale, slug}.
  return LOCALES.flatMap((locale) => pressReleases.map((item) => ({ locale, slug: item.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const pressRelease = await getPressReleaseBySlug(slug, typedLocale)

  if (!pressRelease) return {}

  return generateMeta({
    doc: pressRelease,
    fallbackTitle: 'Press Release',
    fallbackDescription: pressRelease.leadParagraph || pressRelease.excerpts,
    pathname: `/press-release/${slug}`,
    locale: typedLocale,
    ogType: 'article',
  })
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

function splitLeadParagraphs(text?: string | null): string[] {
  if (!text?.trim()) return []
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function formatShortDate(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function FactRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-800/60 last:border-b-0">
      <span className="text-xs text-[#757571]">{label}</span>
      <span className="text-xs text-white text-right">{value}</span>
    </div>
  )
}

function RelatedPressReleaseCard({ item, index, locale }: { item: PressRelease; index: number; locale: TypedLocale }) {
  return (
    <Motion key={item.id} {...motionGridItemProps} transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}>
      <Link
        href={`/${locale}/press-release/${item.slug}`}
        className="bg-[#0F0E0E] border border-zinc-800/40 rounded-lg p-6 h-full min-h-[280px] flex flex-col group hover:border-zinc-700/60 transition-colors"
      >
        <span className="inline-flex self-start items-center gap-2 rounded-full border border-zinc-700/60 bg-[#14120B] px-4 py-2 text-xs text-[#D5D5D5] mb-4">
          <Newspaper size={12} />
          Press Release
        </span>

        <h3 className="text-base font-medium tracking-tight text-white mb-3 line-clamp-3">{item.title}</h3>

        {item.excerpts && (
          <p className="text-xs text-[#757571] leading-relaxed line-clamp-3 mb-auto">{item.excerpts}</p>
        )}

        {(item.code || item.releaseDate) && (
          <div className="flex items-center justify-between mt-auto pt-4 text-xs text-[#757571]">
            <span>{item.code ?? ''}</span>
            <span>{item.releaseDate ? formatShortDate(item.releaseDate) : ''}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-5 mt-5 border-t border-zinc-800/60 text-xs text-[#757571]">
          {(item.readTime || item.categoryLabel) && (
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={12} className="shrink-0" />
              <span className="truncate">
                {item.readTime}
                {item.readTime && item.categoryLabel ? ' · ' : ''}
                {item.categoryLabel}
              </span>
            </div>
          )}
          <span className="flex items-center gap-1 text-sm text-white shrink-0 ml-auto group-hover:gap-2 transition-all">
            Read <ArrowUpRight size={14} />
          </span>
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
  const pressRelease = await getPressReleaseBySlug(slug, typedLocale)

  if (!pressRelease) {
    notFound()
  }

  const mediaKit = pressRelease.releaseFacts?.mediaKit as Media | undefined
  const tagNames = pressRelease.tags?.map((tag) => tag.name).filter(Boolean) as string[] | undefined
  const relatedItems = (pressRelease.relatedPressReleases?.pressReleases as PressRelease[] | undefined)?.filter(
    (item) => item.id !== pressRelease.id,
  )

  const baseUrl = getServerSideURL()
  const shareUrl = `${baseUrl}/${typedLocale}/press-release/${slug}`
  const shareTitle = encodeURIComponent(pressRelease.title ?? '')

  const thumbnail = pressRelease.thumbnail as Media | undefined
  const articleLd = article({
    headline: pressRelease.title ?? 'Press Release',
    description: pressRelease.leadParagraph || pressRelease.excerpts,
    image: thumbnail?.url ?? null,
    datePublished: pressRelease.releaseDate,
    dateModified: pressRelease.updatedAt,
    url: shareUrl,
  })

  const breadcrumbsLd = breadcrumbList([
    { name: 'Home', url: `${baseUrl}/${typedLocale}` },
    { name: 'Stories', url: `${baseUrl}/${typedLocale}/stories` },
    { name: pressRelease.title ?? 'Press Release', url: shareUrl },
  ])

  return (
    <div className="flex flex-col lg:gap-24 gap-10 text-primary max-w-7xl mx-auto w-full px-5 lg:pb-24 pb-10">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbsLd} />
      {/* Headline + dateline */}
      <Motion tag="section" className="w-full lg:pt-16 lg:pb-8 pt-8 pb-4" {...motionSectionProps}>
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-0">
          <Motion className="lg:col-span-2 flex flex-col gap-6" {...motionBlockProps}>
            <div className="flex flex-wrap items-center gap-3">
              {pressRelease.badge && (
                <span className="inline-block border border-[#757571] text-sm px-4 py-1 rounded-full text-[#F4F3EC]">
                  {pressRelease.badge}
                </span>
              )}
              {pressRelease.code && <span className="text-sm text-[#757571]">{pressRelease.code}</span>}
            </div>

            <h1 className="lg:text-4xl text-3xl font-medium tracking-tight leading-[1.15]">{pressRelease.title}</h1>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#757571]">
              {pressRelease.datelineLocation && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} className="shrink-0" />
                  {pressRelease.datelineLocation}
                </span>
              )}
              {pressRelease.releaseDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={12} className="shrink-0" />
                  {formatDate(pressRelease.releaseDate)}
                </span>
              )}
              {tagNames && tagNames.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Tag size={12} className="shrink-0" />
                  {tagNames.join(' · ')}
                </span>
              )}
            </div>
          </Motion>

          {/* <Motion className="bg-[#1B1A17] rounded-lg p-6 h-fit" {...motionGridItemProps}>
            <h2 className="text-sm font-medium mb-4">Release facts</h2>
            <div className="flex flex-col">
              <FactRow label="Release ID" value={pressRelease.code} />
              <FactRow label="For Immediate Release" value={pressRelease.releaseFacts?.forImmediateRelease} />
              <FactRow label="Embargo" value={pressRelease.releaseFacts?.embargo} />
              <FactRow label="Distribution" value={pressRelease.releaseFacts?.distribution} />
              <FactRow label="Date" value={pressRelease.releaseDate ? formatDate(pressRelease.releaseDate) : null} />
            </div>

            {mediaKit?.url && (
              <a
                href={mediaKit.url}
                download
                className="mt-6 w-full inline-flex items-center justify-center gap-2 border border-[#757571] text-sm px-4 py-2.5 rounded-full hover:bg-white/5 transition-colors"
              >
                <Download size={14} />
                Download media kit
                {pressRelease.releaseFacts?.mediaKitSizeLabel && (
                  <span className="text-[#757571]">({pressRelease.releaseFacts.mediaKitSizeLabel})</span>
                )}
              </a>
            )}
          </Motion> */}
        </div>
      </Motion>

      {/* Lead paragraph + content */}
      {(pressRelease.leadParagraph ||
        pressRelease.content ||
        (pressRelease.quotes && pressRelease.quotes.length > 0)) && (
        <Motion tag="section" className="w-full lg:px-0 px-4" {...motionSectionProps}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-x-12 lg:gap-y-10">
            <div className="lg:col-span-2">
              <p className="text-sm font-medium text-white"> {pressRelease.leadParagraph}</p>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-6">
              {pressRelease.content && (
                <RichTextComp
                  content={pressRelease.content as RichText}
                  className="flex flex-col gap-6 [&_p]:text-base [&_p]:text-white [&_p]:leading-[1.6] [&_p]:m-0 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-0 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-0 [&_ul]:mt-2 [&_ul]:space-y-2 [&_li]:text-white"
                />
              )}

              {pressRelease.quotes && pressRelease.quotes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {pressRelease.quotes.map((item, index) => (
                    <Motion
                      key={item.id ?? `quote-${index}`}
                      className="bg-[#14120B] border border-zinc-800/40 p-6 rounded-lg flex flex-col gap-4"
                      {...motionGridItemProps}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
                    >
                      <span className="text-3xl text-[#757571] leading-none">&ldquo;</span>
                      {item.quote && <p className="text-sm text-white leading-relaxed">{item.quote}</p>}
                      <div className="border-t border-zinc-800/60 pt-4 mt-auto">
                        {item.name && <p className="text-sm font-medium text-white">{item.name}</p>}
                        {item.role && <p className="text-xs text-[#757571] mt-1">{item.role}</p>}
                      </div>
                    </Motion>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-4 flex flex-col gap-8 lg:pt-0">
              <div className="flex flex-col gap-3">
                <p className="text-xs text-[#757571]">Share</p>
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#D5D5D5] hover:text-white transition-colors"
                  >
                    X / Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#D5D5D5] hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`mailto:?subject=${shareTitle}&body=${encodeURIComponent(shareUrl)}`}
                    className="text-sm text-[#D5D5D5] hover:text-white transition-colors"
                  >
                    Email
                  </a>
                </div>
              </div>

              {tagNames && tagNames.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-[#757571]">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tagNames.map((tag, index) => (
                      <span
                        key={`tag-${index}`}
                        className="text-xs border border-[#757571] px-4 py-1 rounded-full text-[#F4F3EC]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </Motion>
      )}

      {/* Press & analyst contact */}
      {pressRelease.pressContact?.heading && (
        <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-6 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <Motion className="flex flex-col gap-4 lg:col-span-1" {...motionBlockProps}>
              <h2 className="lg:text-3xl text-2xl font-medium tracking-tight leading-[1.15]">
                {pressRelease.pressContact.heading}
              </h2>
              {pressRelease.pressContact.description && (
                <p className="text-base text-[#D5D5D5] leading-relaxed">{pressRelease.pressContact.description}</p>
              )}
            </Motion>

            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pressRelease.pressContact.press?.name && (
                  <Motion className="bg-[#0F0E0E] p-6 rounded-lg flex flex-col gap-4" {...motionGridItemProps}>
                    <span className="text-xs text-[#757571]">Press inquiries</span>
                    <div>
                      <p className="text-base font-medium">{pressRelease.pressContact.press.name}</p>
                      {pressRelease.pressContact.press.title && (
                        <p className="text-xs text-[#757571] mt-1">{pressRelease.pressContact.press.title}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      {pressRelease.pressContact.press.email && (
                        <a
                          href={`mailto:${pressRelease.pressContact.press.email}`}
                          className="inline-flex items-center gap-2 text-xs text-[#D5D5D5] hover:text-white transition-colors"
                        >
                          <Mail size={12} />
                          {pressRelease.pressContact.press.email}
                        </a>
                      )}
                      {pressRelease.pressContact.press.phone && (
                        <a
                          href={`tel:${pressRelease.pressContact.press.phone.replace(/\s/g, '')}`}
                          className="inline-flex items-center gap-2 text-xs text-[#D5D5D5] hover:text-white transition-colors"
                        >
                          <Phone size={12} />
                          {pressRelease.pressContact.press.phone}
                        </a>
                      )}
                    </div>
                  </Motion>
                )}

                {pressRelease.pressContact.analyst?.name && (
                  <Motion className="bg-[#0F0E0E] p-6 rounded-lg flex flex-col gap-4" {...motionGridItemProps}>
                    <span className="text-xs text-[#757571]">Analyst relations</span>
                    <div>
                      <p className="text-base font-medium">{pressRelease.pressContact.analyst.name}</p>
                      {pressRelease.pressContact.analyst.title && (
                        <p className="text-xs text-[#757571] mt-1">{pressRelease.pressContact.analyst.title}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      {pressRelease.pressContact.analyst.email && (
                        <a
                          href={`mailto:${pressRelease.pressContact.analyst.email}`}
                          className="inline-flex items-center gap-2 text-xs text-[#D5D5D5] hover:text-white transition-colors"
                        >
                          <Mail size={12} />
                          {pressRelease.pressContact.analyst.email}
                        </a>
                      )}
                      {pressRelease.pressContact.analyst.website && (
                        <a
                          href={pressRelease.pressContact.analyst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-[#D5D5D5] hover:text-white transition-colors"
                        >
                          <Globe size={12} />
                          {pressRelease.pressContact.analyst.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </Motion>
                )}
              </div>

              {(pressRelease.pressContact.mediaKitDescription || mediaKit?.url) && (
                <Motion
                  className="bg-[#0F0E0E] p-6 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  {...motionGridItemProps}
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-[#757571]">Media kit</span>
                    {pressRelease.pressContact.mediaKitDescription && (
                      <p className="text-sm text-[#D5D5D5]">{pressRelease.pressContact.mediaKitDescription}</p>
                    )}
                  </div>
                  {mediaKit?.url && (
                    <a
                      href={mediaKit.url}
                      download
                      className="inline-flex items-center justify-center gap-2 bg-[#F4F3EC] text-[#0F0E0E] text-sm font-medium px-5 py-2.5 rounded-full shrink-0 hover:bg-white transition-colors"
                    >
                      <Download size={14} />
                      Download media kit
                      {pressRelease.releaseFacts?.mediaKitSizeLabel && (
                        <span className="opacity-70">({pressRelease.releaseFacts.mediaKitSizeLabel})</span>
                      )}
                    </a>
                  )}
                </Motion>
              )}

              {(pressRelease.pressContact.socialLinks?.twitter ||
                pressRelease.pressContact.socialLinks?.linkedin ||
                pressRelease.pressContact.socialLinks?.website) && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {pressRelease.pressContact.socialLinks.twitter && (
                    <a
                      href={pressRelease.pressContact.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-[#757571] hover:text-white transition-colors"
                    >
                      <span className="text-[#757571]">@</span>
                      {pressRelease.pressContact.socialLinks.twitter.replace(
                        /^https?:\/\/(www\.)?(twitter|x)\.com\//,
                        '@',
                      )}
                    </a>
                  )}
                  {pressRelease.pressContact.socialLinks.linkedin && (
                    <a
                      href={pressRelease.pressContact.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-[#757571] hover:text-white transition-colors"
                    >
                      <Linkedin size={12} />
                      {pressRelease.pressContact.socialLinks.linkedin.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {pressRelease.pressContact.socialLinks.website && (
                    <a
                      href={pressRelease.pressContact.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-[#757571] hover:text-white transition-colors"
                    >
                      <Globe size={12} />
                      {pressRelease.pressContact.socialLinks.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Motion>
      )}

      {/* Related Press Releases */}
      {pressRelease.relatedPressReleases?.heading && relatedItems && relatedItems.length > 0 && (
        <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-6 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
          <Motion className="flex flex-col gap-4 mb-8 max-w-3xl" {...motionBlockProps}>
            <h2 className="lg:text-3xl text-2xl font-medium tracking-tight leading-[1.15]">
              {pressRelease.relatedPressReleases.heading}
            </h2>
            {pressRelease.relatedPressReleases.description && (
              <p className="text-base text-[#D5D5D5] leading-relaxed">
                {pressRelease.relatedPressReleases.description}
              </p>
            )}
          </Motion>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedItems.map((item, index) => (
              <RelatedPressReleaseCard key={item.id} item={item} index={index} locale={typedLocale} />
            ))}
          </div>
        </Motion>
      )}
    </div>
  )
}
