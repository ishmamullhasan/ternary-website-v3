// Single source of truth for the URL-routing locale set. Keep this list in sync with
// `localization.locales` in src/payload.config.ts.
//
// The default locale (en) is served UNPREFIXED at the root; every other locale (bn) keeps a
// /<locale> prefix (/bn/…). Pages still live under the /[locale] App Router segment — the middleware
// rewrites unprefixed URLs onto /en internally and 301-redirects legacy /en/… to the bare path.

import type { TypedLocale } from 'payload'

/** Routing locales, in priority order. `defaultLocale` is first. */
export const LOCALES = ['en', 'bn'] as const

/** The locale used when no prefix can be derived (canonical default — matches payload defaultLocale). */
export const DEFAULT_LOCALE: Locale = 'en'

export type Locale = (typeof LOCALES)[number]

/** Narrowing guard: is `value` one of the routing locales? */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/**
 * Validate an incoming `[locale]` route param and narrow it to a Payload `TypedLocale`.
 * Returns `null` for unknown values so callers can `notFound()`.
 */
export function asTypedLocale(value: string | undefined): TypedLocale | null {
  return isLocale(value) ? (value as TypedLocale) : null
}

/**
 * Map a locale-LESS, root-relative path to its routed URL. The default locale is served UNPREFIXED
 * at the root; every other locale gets a `/<locale>` prefix:
 *   localizedPath('en', '/insights/foo') → `/insights/foo`    localizedPath('en', '/') → `/`
 *   localizedPath('bn', '/insights/foo') → `/bn/insights/foo`  localizedPath('bn', '/') → `/bn`
 * The routes, the canonical/hreflang helper, and the sitemap all derive paths from this so they can
 * never diverge.
 */
export function localizedPath(locale: string, path: string): string {
  const rest = !path || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return rest || '/'
  return `/${locale}${rest}`
}

/** Matches a leading `/en` or `/bn` segment (anchored, segment-boundary aware). */
const LOCALE_PREFIX_RE = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`)

/**
 * Read the routing locale from a pathname's leading segment (`/bn/insights` → `bn`), falling
 * back to `DEFAULT_LOCALE` when there is no recognisable prefix. Lets client components recover
 * the active locale from `usePathname()` without prop-drilling.
 */
export function localeFromPath(pathname: string | null | undefined): Locale {
  const match = pathname?.match(LOCALE_PREFIX_RE)
  return isLocale(match?.[1]) ? match[1] : DEFAULT_LOCALE
}

/**
 * Prefix an internal CMS href for the active locale so in-site navigation stays in the current
 * language (CMS links are stored locale-LESS, e.g. `/insights`). The default locale is unprefixed,
 * so for it this is effectively a normalising pass-through; bn links get a `/bn` prefix.
 * Pass-through, untouched:
 *   - external URLs (`http(s)://…`, protocol-relative `//…`), `mailto:`/`tel:`, hash anchors (`#…`)
 *   - already locale-prefixed paths (`/bn/…`) — never double-prefix.
 * Empty/missing hrefs collapse to the locale home (`/` for en, `/bn` for bn). Non-rooted values are
 * treated as root-relative.
 */
export function localizedHref(locale: string, href: string | null | undefined): string {
  if (!href) return localizedPath(locale, '/')
  if (/^(https?:)?\/\//i.test(href) || /^(mailto:|tel:|#)/i.test(href)) return href
  if (LOCALE_PREFIX_RE.test(href)) return href
  return localizedPath(locale, href)
}
