import Motion from '@/components/animation/motion'
import MobileCarousel from '@/components/layout/MobileCarousel'
import RichTextComp, { type RichText } from '@/components/richtext'
import PressActions from '@/components/sections/insights/PressActions'
import JsonLd from '@/components/seo/JsonLd'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { article, breadcrumbList } from '@/lib/seo/jsonLd'
import type { Media, PressRelease } from '@/payload-types'
import config from '@/payload.config'
import { getServerSideURL } from '@/utilities/getURL'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  Download,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Quote,
  Tag,
  Twitter,
} from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG: prebuild known slugs (generateStaticParams below) and serve them statically. Freshness is
// purely tag-driven (no time-based revalidate) — the pressRelease afterChange/afterDelete hooks
// bust the tags below. dynamicParams lets slugs not in the prebuilt set render on demand.
export const dynamicParams = true

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
    fallbackDescription: pressRelease.excerpts,
    pathname: `/press-release/${slug}`,
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

function FactRow({ label, value, isLast = false }: { label: string; value?: string | null; isLast?: boolean }) {
  if (!value) return null

  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${isLast ? '' : 'border-b border-subtle/50'}`}>
      <span className="text-[14px] text-subtle">{label}</span>
      <span className="text-right text-[16px] text-cream">{value}</span>
    </div>
  )
}

function RelatedPressReleaseCard({ item, index, locale }: { item: PressRelease; index: number; locale: TypedLocale }) {
  return (
    <Motion
      tag="div"
      className="h-full"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
    >
      <Link
        href={`/${locale}/press-release/${item.slug}`}
        className="group flex h-full min-h-[280px] flex-col rounded-md bg-card p-6 ring-1 ring-white/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
      >
        <span className="mb-4 inline-flex w-fit items-center rounded-full bg-badge px-4 py-1.5 text-[12px] text-cream">
          Press Release
        </span>

        <h3 className="mb-3 text-[16px] font-medium tracking-[-0.01em] text-cream line-clamp-3">{item.title}</h3>

        {item.excerpts && <p className="mb-auto text-[14px] leading-relaxed text-body line-clamp-3">{item.excerpts}</p>}

        {(item.code || item.releaseDate) && (
          <div className="mt-auto flex items-center justify-between pt-4 text-[12px] text-subtle">
            <span>{item.code ?? ''}</span>
            {item.releaseDate && <time dateTime={item.releaseDate}>{formatShortDate(item.releaseDate)}</time>}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-subtle/50 pt-5 text-[12px] text-subtle">
          {(item.readTime || item.categoryLabel) && (
            <div className="flex min-w-0 items-center gap-2">
              <Clock size={12} className="shrink-0" />
              <span className="truncate">
                {item.readTime}
                {item.readTime && item.categoryLabel ? ' · ' : ''}
                {item.categoryLabel}
              </span>
            </div>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[16px] text-cream transition-all group-hover:gap-2">
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
    description: pressRelease.excerpts,
    image: thumbnail?.url ?? null,
    datePublished: pressRelease.releaseDate,
    dateModified: pressRelease.updatedAt,
    url: shareUrl,
  })

  const facts = pressRelease.releaseFacts
  const showReleaseFacts = Boolean(
    pressRelease.code ||
    facts?.forImmediateRelease ||
    facts?.embargo ||
    facts?.distribution ||
    pressRelease.releaseDate,
  )

  const breadcrumbsLd = breadcrumbList([
    { name: 'Home', url: `${baseUrl}/${typedLocale}` },
    { name: 'Stories', url: `${baseUrl}/${typedLocale}/stories` },
    { name: pressRelease.title ?? 'Press Release', url: shareUrl },
  ])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 pb-16 lg:gap-[72px] lg:pb-24 print:gap-8 print:text-black">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbsLd} />

      {/* Sub-nav strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-8 lg:pt-12 print:hidden">
        <Link
          href={`/${typedLocale}/newsroom`}
          className="group inline-flex items-center gap-2 rounded-[2px] text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Newsroom
        </Link>
        <div className="flex items-center gap-5">
          {pressRelease.releaseFacts?.forImmediateRelease && (
            <span className="inline-flex items-center gap-2 rounded-full bg-badge px-3.5 py-1.5 text-[12px] text-cream">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              For Immediate Release
            </span>
          )}
          <PressActions url={shareUrl} />
        </div>
      </div>

      {/* Header — left text column + Release facts card */}
      <Motion tag="section" {...reveal}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_452px] lg:gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {pressRelease.badge && (
                <span className="inline-flex items-center rounded-full border border-subtle bg-main px-4 py-1.5 text-[14px] text-cream">
                  {pressRelease.badge}
                </span>
              )}
              {pressRelease.code && (
                <span className="text-[14px] uppercase tracking-[0.08em] text-subtle">{pressRelease.code}</span>
              )}
            </div>

            <h1 className="font-display text-3xl font-medium leading-[1.15] tracking-[-0.04em] text-cream lg:text-[40px]">
              {pressRelease.title}
            </h1>

            {pressRelease.excerpts && (
              <p className="max-w-2xl text-[16px] leading-relaxed tracking-[-0.01em] text-body">
                {pressRelease.excerpts}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-[14px] text-subtle">
              {pressRelease.datelineLocation && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={14} className="shrink-0" />
                  {pressRelease.datelineLocation}
                </span>
              )}
              {pressRelease.releaseDate && (
                <span className="inline-flex items-center gap-2">
                  <Calendar size={14} className="shrink-0" />
                  <time dateTime={pressRelease.releaseDate}>{formatDate(pressRelease.releaseDate)}</time>
                </span>
              )}
              {tagNames && tagNames.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Tag size={14} className="shrink-0" />
                  {tagNames.join(' · ')}
                </span>
              )}
            </div>
          </div>

          {showReleaseFacts && (
            <div className="flex h-fit flex-col rounded-md bg-main p-6">
              <h2 className="mb-2 text-[16px] font-medium text-cream">Release facts</h2>
              <div className="flex flex-col">
                <FactRow label="Release ID" value={pressRelease.code} />
                <FactRow label="For Immediate Release" value={facts?.forImmediateRelease} />
                <FactRow label="Embargo" value={facts?.embargo} />
                <FactRow label="Distribution" value={facts?.distribution} />
                <FactRow
                  label="Date"
                  value={pressRelease.releaseDate ? formatDate(pressRelease.releaseDate) : null}
                  isLast
                />
              </div>

              {mediaKit?.url && (
                <a
                  href={mediaKit.url}
                  download
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-cream/40 px-4 py-2.5 text-[14px] text-cream transition-colors hover:border-cream/60 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                >
                  <Download size={14} />
                  Download media kit
                  {facts?.mediaKitSizeLabel && <span className="text-subtle">({facts.mediaKitSizeLabel})</span>}
                </a>
              )}
            </div>
          )}
        </div>
      </Motion>

      {/* The release — 3-rail editorial grid */}
      {(pressRelease.leadParagraph ||
        pressRelease.content ||
        (pressRelease.quotes && pressRelease.quotes.length > 0)) && (
        <Motion tag="section" {...reveal}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr_260px] lg:gap-x-8 lg:gap-y-10">
            <div>
              <p className="font-display text-3xl font-medium leading-[1.15] tracking-[-0.04em] text-cream/90">
                The release
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {pressRelease.leadParagraph && (
                <RichTextComp
                  content={pressRelease.leadParagraph as RichText}
                  className="flex flex-col gap-4 [&_p]:m-0 [&_p]:text-[16px] [&_p]:leading-[1.8] [&_p]:tracking-[-0.01em] [&_p]:text-body"
                />
              )}

              {pressRelease.content && (
                <RichTextComp
                  content={pressRelease.content as RichText}
                  className="flex flex-col gap-8 [&_h2]:mt-2 [&_h2]:mb-0 [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.05em] [&_h2]:text-cream [&_h3]:mt-2 [&_h3]:mb-0 [&_h3]:text-[20px] [&_h3]:font-semibold [&_h3]:leading-[1.15] [&_h3]:tracking-[-0.05em] [&_h3]:text-cream [&_li]:text-body [&_p]:m-0 [&_p]:text-[16px] [&_p]:leading-[1.8] [&_p]:tracking-[-0.01em] [&_p]:text-body [&_ul]:mt-2 [&_ul]:space-y-2"
                />
              )}

              {pressRelease.quotes && pressRelease.quotes.length > 0 && (
                <div className="flex flex-col gap-8 pt-4">
                  <p className="text-[12px] leading-[1.15] tracking-[-0.05em] text-subtle">Quotes</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {pressRelease.quotes.map((item, index) => (
                      <Motion
                        key={item.id ?? `quote-${index}`}
                        tag="figure"
                        className="flex flex-col gap-4 rounded-lg bg-main p-6"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.3) }}
                      >
                        <Quote size={20} className="text-subtle" aria-hidden />
                        {item.quote && (
                          <blockquote className="text-[16px] leading-relaxed tracking-[-0.01em] text-cream">
                            {item.quote}
                          </blockquote>
                        )}
                        <figcaption className="mt-auto border-t border-subtle pt-4">
                          {item.name && <p className="text-[16px] font-medium text-cream">{item.name}</p>}
                          {item.role && <p className="mt-1 text-[12px] text-subtle">{item.role}</p>}
                        </figcaption>
                      </Motion>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-8 self-start lg:sticky lg:top-24">
              <div className="flex flex-col gap-3">
                <p className="text-[12px] leading-[1.15] tracking-[-0.05em] text-subtle">Share</p>
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-[2px] text-[16px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                  >
                    <Twitter size={14} className="shrink-0" aria-hidden />X / Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-[2px] text-[16px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                  >
                    <Linkedin size={14} className="shrink-0" aria-hidden />
                    LinkedIn
                  </a>
                  <a
                    href={`mailto:?subject=${shareTitle}&body=${encodeURIComponent(shareUrl)}`}
                    className="inline-flex w-fit items-center gap-2 rounded-[2px] text-[16px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                  >
                    <Mail size={14} className="shrink-0" aria-hidden />
                    Email
                  </a>
                </div>
              </div>

              {tagNames && tagNames.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[12px] leading-[1.15] tracking-[-0.05em] text-subtle">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tagNames.map((tag, index) => (
                      <span
                        key={`tag-${index}`}
                        className="rounded-full border border-subtle bg-main px-4 py-1.5 text-[12px] text-subtle"
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

      {/* Press & analyst contact — flush on page background */}
      {pressRelease.pressContact?.heading && (
        <Motion tag="section" {...reveal}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col gap-4 lg:col-span-1">
              <h2 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.02em] text-cream lg:text-[28px]">
                {pressRelease.pressContact.heading}
              </h2>
              {pressRelease.pressContact.description && (
                <RichTextComp
                  content={pressRelease.pressContact.description as RichText}
                  className="[&_p]:m-0 [&_p]:text-[16px] [&_p]:leading-relaxed [&_p]:text-body"
                />
              )}
            </div>

            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pressRelease.pressContact.press?.name && (
                  <div className="flex flex-col gap-4 rounded-md bg-main p-6">
                    <span className="text-[14px] text-subtle">Press inquiries</span>
                    <div>
                      <p className="text-[16px] font-medium text-cream">{pressRelease.pressContact.press.name}</p>
                      {pressRelease.pressContact.press.title && (
                        <p className="mt-1 text-[14px] text-subtle">{pressRelease.pressContact.press.title}</p>
                      )}
                    </div>
                    <div className="mt-auto flex flex-col gap-2 border-t border-subtle/50 pt-4">
                      {pressRelease.pressContact.press.email && (
                        <a
                          href={`mailto:${pressRelease.pressContact.press.email}`}
                          className="inline-flex w-fit items-center gap-2 rounded-[2px] text-[14px] text-body transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                        >
                          <Mail size={14} />
                          {pressRelease.pressContact.press.email}
                        </a>
                      )}
                      {pressRelease.pressContact.press.phone && (
                        <a
                          href={`tel:${pressRelease.pressContact.press.phone.replace(/\s/g, '')}`}
                          className="inline-flex w-fit items-center gap-2 rounded-[2px] text-[14px] text-body transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                        >
                          <Phone size={14} />
                          {pressRelease.pressContact.press.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {pressRelease.pressContact.analyst?.name && (
                  <div className="flex flex-col gap-4 rounded-md bg-main p-6">
                    <span className="text-[14px] text-subtle">Analyst relations</span>
                    <div>
                      <p className="text-[16px] font-medium text-cream">{pressRelease.pressContact.analyst.name}</p>
                      {pressRelease.pressContact.analyst.title && (
                        <p className="mt-1 text-[14px] text-subtle">{pressRelease.pressContact.analyst.title}</p>
                      )}
                    </div>
                    <div className="mt-auto flex flex-col gap-2 border-t border-subtle/50 pt-4">
                      {pressRelease.pressContact.analyst.email && (
                        <a
                          href={`mailto:${pressRelease.pressContact.analyst.email}`}
                          className="inline-flex w-fit items-center gap-2 rounded-[2px] text-[14px] text-body transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                        >
                          <Mail size={14} />
                          {pressRelease.pressContact.analyst.email}
                        </a>
                      )}
                      {pressRelease.pressContact.analyst.website && (
                        <a
                          href={pressRelease.pressContact.analyst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-fit items-center gap-2 rounded-[2px] text-[14px] text-body transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                        >
                          <Globe size={14} />
                          {pressRelease.pressContact.analyst.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {(pressRelease.pressContact.mediaKitDescription || mediaKit?.url) && (
                <div className="flex flex-col gap-4 rounded-md bg-main p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-[14px] text-subtle">Media kit</span>
                    {pressRelease.pressContact.mediaKitDescription && (
                      <p className="text-[16px] text-body">{pressRelease.pressContact.mediaKitDescription}</p>
                    )}
                  </div>
                  {mediaKit?.url && (
                    <a
                      href={mediaKit.url}
                      download
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cream px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                    >
                      <Download size={14} />
                      Download media kit
                      {facts?.mediaKitSizeLabel && <span className="opacity-70">({facts.mediaKitSizeLabel})</span>}
                    </a>
                  )}
                </div>
              )}

              {(pressRelease.pressContact.socialLinks?.twitter ||
                pressRelease.pressContact.socialLinks?.linkedin ||
                pressRelease.pressContact.socialLinks?.website) && (
                <div className="flex flex-wrap gap-5 pt-2">
                  {pressRelease.pressContact.socialLinks.twitter && (
                    <a
                      href={pressRelease.pressContact.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-[2px] text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                    >
                      <span aria-hidden>@</span>
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
                      className="inline-flex items-center gap-2 rounded-[2px] text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                    >
                      <Linkedin size={14} />
                      {pressRelease.pressContact.socialLinks.linkedin.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {pressRelease.pressContact.socialLinks.website && (
                    <a
                      href={pressRelease.pressContact.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-[2px] text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
                    >
                      <Globe size={14} />
                      {pressRelease.pressContact.socialLinks.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Motion>
      )}

      {/* Related Press Releases — flush on page background */}
      {pressRelease.relatedPressReleases?.heading && relatedItems && relatedItems.length > 0 && (
        <Motion tag="section" {...reveal}>
          <div className="mb-8 flex max-w-3xl flex-col gap-4">
            <h2 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.02em] text-cream lg:text-[28px]">
              {pressRelease.relatedPressReleases.heading}
            </h2>
            {pressRelease.relatedPressReleases.description && (
              <RichTextComp
                content={pressRelease.relatedPressReleases.description as RichText}
                className="[&_p]:m-0 [&_p]:text-[16px] [&_p]:leading-relaxed [&_p]:text-body"
              />
            )}
          </div>

          {/* Mobile: horizontal snap carousel with pagination dots. */}
          <MobileCarousel slideClassName="w-[280px]">
            {relatedItems.map((item, index) => (
              <RelatedPressReleaseCard key={item.id} item={item} index={index} locale={typedLocale} />
            ))}
          </MobileCarousel>

          {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
          <div className="hidden gap-4 sm:grid md:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((item, index) => (
              <RelatedPressReleaseCard key={item.id} item={item} index={index} locale={typedLocale} />
            ))}
          </div>
        </Motion>
      )}
    </div>
  )
}
