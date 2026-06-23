import RichTextComp, { type RichText } from '@/components/richtext'
import JsonLd from '@/components/seo/JsonLd'
import { asTypedLocale, LOCALES, localizedPath } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { article, breadcrumbList } from '@/lib/seo/jsonLd'
import type { Insight, Media, PressRelease, Story } from '@/payload-types'
import config from '@/payload.config'
import { getServerSideURL } from '@/utilities/getURL'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

type ContentCollection = 'story' | 'insight' | 'pressRelease'

type ContentDoc = Story | Insight | PressRelease

const COLLECTION_CONFIG: Record<ContentCollection, { label: string; listPath: string; tag: string }> = {
  story: { label: 'Case Study', listPath: '/stories', tag: 'story' },
  insight: { label: 'Thought Piece', listPath: '/stories', tag: 'insight' },
  pressRelease: { label: 'Press Release', listPath: '/stories', tag: 'pressRelease' },
}

async function fetchDocBySlug(
  collection: ContentCollection,
  slug: string,
  locale: TypedLocale,
): Promise<ContentDoc | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as ContentDoc | undefined) ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('<slug>')` / `revalidateTag('<slug>_<docSlug>')` calls in the
// makeContentCollection afterChange hook. In draft mode (live preview) we bypass the cache so
// editors always see the freshest data.
async function getDocBySlug(
  collection: ContentCollection,
  slug: string,
  locale: TypedLocale,
): Promise<ContentDoc | null> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchDocBySlug(collection, slug, locale)
  return unstable_cache(() => fetchDocBySlug(collection, slug, locale), [`${collection}_${slug}_${locale}`], {
    tags: [`${collection}_${slug}`, COLLECTION_CONFIG[collection].tag],
  })()
}

function getListPath(collection: ContentCollection): string {
  return COLLECTION_CONFIG[collection].listPath
}

function getDetailPath(collection: ContentCollection, slug: string): string {
  switch (collection) {
    case 'story':
      return `/case-studies/${slug}`
    case 'insight':
      return `/insights/${slug}`
    case 'pressRelease':
      return `/press-release/${slug}`
  }
}

export function createContentDetailPage(collection: ContentCollection) {
  async function generateStaticParams() {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection,
      limit: 100,
      depth: 0,
    })

    // Cross-product: one entry per {locale, slug}.
    return LOCALES.flatMap((locale) => result.docs.map((doc) => ({ locale, slug: doc.slug })))
  }

  async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string; slug: string }>
  }): Promise<Metadata> {
    const { locale, slug } = await params
    const typedLocale = asTypedLocale(locale)
    if (!typedLocale) return {}
    const doc = await getDocBySlug(collection, slug, typedLocale)

    if (!doc) return {}

    return generateMeta({
      doc,
      fallbackTitle: COLLECTION_CONFIG[collection].label,
      fallbackDescription: doc.excerpts,
      pathname: getDetailPath(collection, slug),
      locale: typedLocale,
      ogType: 'article',
    })
  }

  async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<JSX.Element> {
    const { locale, slug } = await params
    const typedLocale = asTypedLocale(locale)
    if (!typedLocale) notFound()
    const doc = await getDocBySlug(collection, slug, typedLocale)

    if (!doc) notFound()

    const thumbnail = doc.thumbnail as Media | undefined
    const { label, listPath } = COLLECTION_CONFIG[collection]

    const baseUrl = getServerSideURL()
    const detailUrl = `${baseUrl}/${typedLocale}${getDetailPath(collection, slug)}`
    // Insights expose an explicit publishedDate; stories/press releases fall back to createdAt.
    const publishedDate = (doc as Insight).publishedDate
    const datePublished = publishedDate ?? doc.createdAt

    const articleLd = article({
      headline: doc.title ?? label,
      description: doc.excerpts,
      image: thumbnail?.url ?? null,
      datePublished,
      dateModified: doc.updatedAt,
      url: detailUrl,
    })

    const breadcrumbsLd = breadcrumbList([
      { name: 'Home', url: `${baseUrl}/${typedLocale}` },
      { name: 'Stories', url: `${baseUrl}/${typedLocale}${listPath}` },
      { name: doc.title ?? label, url: detailUrl },
    ])

    return (
      <div className="max-w-4xl mx-auto w-full px-4 lg:px-0 py-12 lg:py-20 text-primary">
        <JsonLd data={articleLd} />
        <JsonLd data={breadcrumbsLd} />
        <Link
          href={localizedPath(typedLocale, listPath)}
          className="text-sm text-subtle hover:text-cream transition-colors mb-8 inline-block"
        >
          ← Back to stories
        </Link>

        <div className="space-y-6 mb-10">
          <span className="inline-flex items-center rounded-full border border-line bg-button-dark px-4 py-2 text-xs text-body">
            {label}
          </span>
          <h1 className="text-3xl lg:text-5xl font-medium tracking-tight text-cream leading-tight">{doc.title}</h1>
          {doc.excerpts && <p className="text-base text-body leading-relaxed max-w-2xl">{doc.excerpts}</p>}
        </div>

        {thumbnail?.url && (
          <div className="relative w-full h-[280px] lg:h-[420px] rounded-md overflow-hidden mb-10">
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt || doc.title || label}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {doc.content && (
          <div className="prose prose-invert max-w-none">
            <RichTextComp content={doc.content as RichText} />
          </div>
        )}
      </div>
    )
  }

  return { Page, generateMetadata, generateStaticParams, getDetailPath }
}

export { getDetailPath, getListPath }
