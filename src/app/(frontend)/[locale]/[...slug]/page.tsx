import { RenderBlocks } from '@/blocks/RenderBlocks'
import JsonLd from '@/components/seo/JsonLd'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { breadcrumbList } from '@/lib/seo/jsonLd'
import { pagePath } from '@/lib/seo/pagePath'
import type { Page as PageDoc } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import config from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

const fetchPageByPath = async (segments: string[], draft: boolean, locale: TypedLocale): Promise<PageDoc | null> => {
  const payload = await getPayload({ config })
  const path = `/${segments.join('/')}`
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: segments[segments.length - 1] } },
    draft,
    locale,
    // Pages are public, but the content collections they reference (capability, solution,
    // team, …) are not publicly readable — so with overrideAccess:false Payload returns
    // bare relationship ids instead of populating them, and block sections render empty.
    // Published pages are public content, so override access to populate relationships.
    overrideAccess: true,
    depth: 2,
    limit: 10,
  })
  // Disambiguate same-slug pages under different parents by the full breadcrumb path.
  return result.docs.find((page) => pagePath(page) === path) ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('pages')` / `revalidateTag('pages_<slug>')` calls in the Pages afterChange hook.
// The cache key is the full path (segments disambiguate same-slug pages under different parents);
// tags are the collection-wide `pages` tag plus the per-slug `pages_<lastSegment>` tag the hook
// emits. In draft mode (live preview) we bypass the cache so editors always see the freshest draft.
const queryPageByPath = (segments: string[], draft: boolean, locale: TypedLocale): Promise<PageDoc | null> => {
  if (draft) return fetchPageByPath(segments, true, locale)
  const slug = segments[segments.length - 1]
  const path = segments.join('/')
  return unstable_cache(() => fetchPageByPath(segments, false, locale), [`pages_${path}_${locale}`], {
    tags: ['pages', `pages_${slug}`],
  })()
}

export async function generateStaticParams(): Promise<{ locale: string; slug: string[] }[]> {
  const payload = await getPayload({ config })
  const pages = await payload.find({ collection: 'pages', limit: 1000, depth: 1 })
  const slugs = pages.docs.map((page) => pagePath(page).split('/').filter(Boolean)).filter((slug) => slug.length > 0)
  // Cross-product: one entry per {locale, slug} combination.
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageByPath(slug, draft, typedLocale)
  if (!page) return {}
  return generateMeta({ doc: page, pathname: pagePath(page), locale: typedLocale })
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>
}): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageByPath(slug, draft, typedLocale)

  if (!page) notFound()

  // BreadcrumbList from the nested-docs breadcrumb chain (absolute urls).
  const base = getServerSideURL()
  const crumbs = (page.breadcrumbs ?? [])
    .filter((c) => c.label && c.url)
    .map((c) => ({ name: c.label as string, url: `${base}/${typedLocale}${c.url}` }))

  return (
    <main>
      {crumbs.length > 0 && <JsonLd data={breadcrumbList(crumbs)} />}
      <RenderBlocks blocks={page.layout} />
    </main>
  )
}
