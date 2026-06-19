import { DEFAULT_LOCALE } from '@/lib/i18n/locales'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Build a draft-preview URL that routes THROUGH the /next/preview route
 * (src/app/(frontend)/next/preview/route.ts) so draft mode is enabled before the editor lands on
 * the page. Used by both the admin live-preview iframe and the "Preview" button (WEB-449).
 *
 * `localePath` must be a locale-prefixed, root-relative path (e.g. `/en/insights/foo`); the route
 * validates that it starts with `/` and redirects to it once draft mode + auth pass. `previewSecret`
 * is read from `PREVIEW_SECRET` (set in Vercel) and checked by the route before authorizing.
 */
export const buildPreviewURL = ({
  localePath,
  collection,
  slug,
}: {
  localePath: string
  collection: string
  slug: string
}): string =>
  `${getServerSideURL()}/next/preview?path=${encodeURIComponent(localePath)}&collection=${collection}&slug=${slug}&previewSecret=${process.env.PREVIEW_SECRET}`

/** Build the live-preview URL for a content collection whose detail route is `/<locale>/<segment>/<slug>`. */
export const detailPreviewURL = (collection: string, segment: string, data?: { slug?: unknown }): string => {
  const slug = typeof data?.slug === 'string' ? data.slug : ''
  return buildPreviewURL({ localePath: `/${DEFAULT_LOCALE}/${segment}/${slug}`, collection, slug })
}

/** Build the live-preview URL for a content collection that renders on a single landing page (no per-slug route). */
export const landingPreviewURL = (collection: string, landingPath: string, data?: { slug?: unknown }): string => {
  const slug = typeof data?.slug === 'string' ? data.slug : ''
  return buildPreviewURL({ localePath: `/${DEFAULT_LOCALE}${landingPath}`, collection, slug })
}
