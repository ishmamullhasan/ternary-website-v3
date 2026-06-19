// Single source of truth for the URL-routing locale set (WEB-445 always-prefixed [locale] routing).
// Keep this list in sync with `localization.locales` in src/payload.config.ts.
//
// Every public page lives under a /[locale] segment (/en/…, /bn/…) — `en` is NOT special-cased in
// the URL, it is always prefixed. The middleware 301-redirects unprefixed/legacy URLs to /en/….

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
 * Prefix a locale-LESS, root-relative path with the locale segment.
 * `localizedPath('en', '/insights/foo')` → `/en/insights/foo`; `localizedPath('bn', '/')` → `/bn`.
 * Both the routes, the canonical/hreflang helper, and the sitemap derive prefixed paths from this
 * so they can never diverge.
 */
export function localizedPath(locale: string, path: string): string {
  if (!path || path === '/') return `/${locale}`
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`
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
 * Prefix an internal CMS href with the active locale so in-site navigation stays in the current
 * language (WEB-445 — CMS links are stored locale-LESS, e.g. `/insights`). Pass-through, untouched:
 *   - external URLs (`http(s)://…`, protocol-relative `//…`), `mailto:`/`tel:`, hash anchors (`#…`)
 *   - already locale-prefixed paths (`/en/…`, `/bn`) — never double-prefix.
 * Empty/missing hrefs collapse to the locale home (`/en`). Non-rooted values are treated as
 * root-relative. Without this, clicking a locale-less link 301s back to the default locale.
 */
export function localizedHref(locale: string, href: string | null | undefined): string {
  if (!href) return `/${locale}`
  if (/^(https?:)?\/\//i.test(href) || /^(mailto:|tel:|#)/i.test(href)) return href
  if (LOCALE_PREFIX_RE.test(href)) return href
  return localizedPath(locale, href)
}
