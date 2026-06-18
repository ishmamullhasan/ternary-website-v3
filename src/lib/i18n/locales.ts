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
