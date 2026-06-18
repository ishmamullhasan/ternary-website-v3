import type { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from './config'

/**
 * The plugin-seo "meta" group attached to every public collection (WEB-442).
 * Shape mirrors `doc.meta` in src/payload-types.ts — read-only here (this ticket is behaviour only).
 */
export type SeoMeta = {
  title?: string | null
  description?: string | null
  image?: (string | null) | Media
  canonical?: string | null
  hideFromSitemap?: boolean | null
  twitterCard?: ('summary' | 'summary_large_image') | null
} | null

type GenerateMetaArgs = {
  /** The doc whose `meta` group + own fields drive the tags. */
  doc?: { meta?: SeoMeta; title?: string | null } | null
  /** Title used when neither meta.title nor doc.title is set. */
  fallbackTitle?: string | null
  /** Description used when meta.description is absent (e.g. doc.excerpts/leadParagraph/summary). */
  fallbackDescription?: string | null
  /** Absolute-from-root path of this page, e.g. "/insights/foo". Drives og:url + default canonical. */
  pathname: string
  /** Open Graph object type. Defaults to "website"; detail pages pass "article". */
  ogType?: 'website' | 'article'
}

/** Resolve `meta.image` (which may be an id, a populated Media object, or unset) to a URL. */
function resolveImageUrl(image: Media | string | null | undefined): string | null {
  if (!image) return null
  // depth 0 / unpopulated relationship → bare id; we have no URL, fall back to the default.
  if (typeof image === 'string') return null
  return image.url ? getMediaUrl(image.url) : null
}

/** Turn a root-relative pathname into an absolute URL using the server-side base URL. */
function absolute(pathname: string): string {
  const base = getServerSideURL()
  if (!pathname || pathname === '/') return base
  return `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

/**
 * Build a Next.js `Metadata` object from a doc's plugin-seo `meta` group + site defaults.
 *
 * Precedence:
 *   title       → meta.title || fallbackTitle || doc.title || SITE_NAME
 *   description → meta.description || fallbackDescription || SITE_DESCRIPTION
 *   image       → resolved meta.image || DEFAULT_OG_IMAGE (omitted if neither exists)
 *   canonical   → meta.canonical || absolute(pathname)
 *
 * The title template ('%s | Ternary Solutions') lives on the layout's metadata export, so the
 * `title` returned here is the bare page title — Next composes the suffix.
 */
export async function generateMeta({
  doc,
  fallbackTitle,
  fallbackDescription,
  pathname,
  ogType = 'website',
}: GenerateMetaArgs): Promise<Metadata> {
  const meta = doc?.meta ?? null

  const title = meta?.title || fallbackTitle || doc?.title || SITE_NAME
  const description = meta?.description || fallbackDescription || SITE_DESCRIPTION

  const url = absolute(pathname)
  const canonical = meta?.canonical || url

  const resolvedImage = resolveImageUrl(meta?.image)
  const ogImage = resolvedImage || (DEFAULT_OG_IMAGE ? getMediaUrl(DEFAULT_OG_IMAGE) : null)
  const images = ogImage ? [{ url: ogImage }] : undefined

  const twitterCard = meta?.twitterCard || 'summary_large_image'

  return {
    title,
    description,
    alternates: {
      canonical,
      // EXTENSION POINT (WEB-445/446 i18n): once localization lands, populate per-locale hreflang here:
      //   languages: { en: absolute(`/en${pathname}`), bn: absolute(`/bn${pathname}`) }
      // The site is single-locale today, so we intentionally leave `languages` unset.
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  }
}
