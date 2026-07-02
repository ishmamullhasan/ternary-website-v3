import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload, type TypedLocale } from 'payload'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0, locale?: TypedLocale) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return global
}

/**
 * Tag-based ISR (WEB-457): published global reads are cached and busted on-demand by the
 * `revalidateTag('<slug>')` calls in each global's afterChange hook. In draft mode (live preview)
 * we bypass the cache entirely so editors always see the freshest data.
 *
 * The cache key includes the locale so /en and /bn don't share an entry, plus a CACHE_VERSION
 * segment. Bumping CACHE_VERSION changes every key, forcing a fresh fetch on the next deploy —
 * the deterministic way to clear Vercel's cross-deploy Data Cache when a global was edited outside
 * a Next request (e.g. an admin ops script, whose afterChange `revalidateTag` can't fire and so
 * leaves a stale entry the header/footer then render forever).
 *
 * Freshness is purely tag-driven (no time-based revalidate): out-of-request edits must be followed
 * by GET /next/revalidate or the admin "Revalidate site" button (or a CACHE_VERSION bump).
 */
const CACHE_VERSION = 'v3'

function cachedGlobal(slug: Global, depth: number, tags: string[], locale?: TypedLocale) {
  return unstable_cache(
    () => getGlobal(slug, depth, locale),
    [`global_${slug}_${depth}_${locale ?? 'default'}_${CACHE_VERSION}`],
    { tags },
  )()
}

/**
 * Fetches header global. Uses depth: 1 to populate logo media with URL.
 * Pass `locale` to localize; omit to use Payload's defaultLocale.
 * Cached + revalidated by the `header` tag; bypassed in draft mode.
 */
export async function getHeader(locale?: TypedLocale) {
  const { isEnabled: draft } = await draftMode()
  return draft ? getGlobal('header', 1, locale) : cachedGlobal('header', 1, ['header'], locale)
}

/**
 * Fetches footer global. Uses depth: 1 to populate logo media with URL.
 * Pass `locale` to localize; omit to use Payload's defaultLocale.
 * Cached + revalidated by the `footer` tag; bypassed in draft mode.
 * Also tagged with `capability`/`solution`/`industry`: the footer nav menus are relationships to
 * those collections (depth-populated titles/slugs), so renaming one of those docs must bust the
 * footer cache too, not just its own pages.
 */
export async function getFooter(locale?: TypedLocale) {
  const { isEnabled: draft } = await draftMode()
  return draft
    ? getGlobal('footer', 1, locale)
    : cachedGlobal('footer', 1, ['footer', 'capability', 'solution', 'industry'], locale)
}
