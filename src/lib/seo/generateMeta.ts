import { DEFAULT_LOCALE, LOCALES, localizedPath } from '@/lib/i18n/locales'
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
  /**
   * Locale-LESS, root-relative path of this page, e.g. "/insights/foo" (NOT "/en/insights/foo").
   * The locale prefix is applied here via `localizedPath` so canonical + hreflang stay consistent.
   */
  pathname: string
  /**
   * The locale this page is being rendered for (one of LOCALES). Drives the canonical prefix and
   * og:url. Defaults to the default locale so legacy single-locale callers keep working.
   */
  locale?: string
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
 * Absolute URL of a dynamically rendered Open Graph card (src/app/og/route.tsx), used as the
 * og:image / twitter:image fallback when a page has no explicit SEO image. Encodes the page
 * title + a sensible subtitle into the query string so each page gets a branded, unique card.
 */
function dynamicOgImageUrl(title: string, subtitle: string): string {
  const params = new URLSearchParams({ title, subtitle })
  return `${getServerSideURL()}/og?${params.toString()}`
}

/**
 * Build a Next.js `Metadata` object from a doc's plugin-seo `meta` group + site defaults.
 *
 * Precedence:
 *   title       → meta.title || fallbackTitle || doc.title || SITE_NAME
 *   description → meta.description || fallbackDescription || SITE_DESCRIPTION
 *   image       → resolved meta.image || DEFAULT_OG_IMAGE (omitted if neither exists)
 *   canonical   → meta.canonical || absolute(localizedPath(locale, pathname))
 *
 * `pathname` is locale-LESS ("/insights/foo"); the locale prefix is applied here so canonical,
 * og:url, and the hreflang alternates all stay in lockstep with the route + sitemap.
 *
 * The title template ('%s | Ternary Solutions') lives on the layout's metadata export, so the
 * `title` returned here is the bare page title — Next composes the suffix.
 */
export async function generateMeta({
  doc,
  fallbackTitle,
  fallbackDescription,
  pathname,
  locale = DEFAULT_LOCALE,
  ogType = 'website',
}: GenerateMetaArgs): Promise<Metadata> {
  const meta = doc?.meta ?? null

  // Precedence matches the documented intent: explicit SEO title, then the doc's own title, then
  // the per-page fallback, then the site name. (Previously fallbackTitle wrongly preceded doc.title,
  // so pages without a meta group — e.g. jobs, legals — showed the generic fallback as their title.)
  const title = meta?.title || doc?.title || fallbackTitle || SITE_NAME
  const description = meta?.description || fallbackDescription || SITE_DESCRIPTION

  // Prefixed absolute URL for the locale this page renders as.
  const url = absolute(localizedPath(locale, pathname))
  const canonical = meta?.canonical || url

  // hreflang map: one entry per locale + x-default (→ the default locale). A doc-level canonical
  // override still wins on `canonical`, but the alternates always describe the true per-locale URLs.
  const languages: Record<string, string> = {}
  for (const l of LOCALES) {
    languages[l] = absolute(localizedPath(l, pathname))
  }
  languages['x-default'] = absolute(localizedPath(DEFAULT_LOCALE, pathname))

  // Explicit SEO image wins. Otherwise render a branded per-page OG card via /og (WEB-451),
  // built from the page title + description so each page gets a unique social image. The static
  // DEFAULT_OG_IMAGE remains the final fallback if the title is somehow empty.
  const resolvedImage = resolveImageUrl(meta?.image)
  const dynamicImage = title ? dynamicOgImageUrl(title, description) : null
  const ogImage = resolvedImage || dynamicImage || (DEFAULT_OG_IMAGE ? getMediaUrl(DEFAULT_OG_IMAGE) : null)
  const images = ogImage ? [{ url: ogImage }] : undefined

  const twitterCard = meta?.twitterCard || 'summary_large_image'

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
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
