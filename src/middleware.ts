import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Locale routing: the default locale (en) is served UNPREFIXED at the root; other locales (bn) keep
// a /<locale> prefix. Every public page still lives under the /[locale] App Router segment, so:
//   /, /about, /insights/x      → rewritten (URL unchanged) onto /en, /en/about, /en/insights/x
//   /bn, /bn/about              → pass through, rendered by the [locale]=bn segment
//   /en, /en/about (legacy)     → 301-redirected to the unprefixed canonical (/, /about)
//
// The default locale is DETERMINISTIC; we deliberately do NOT negotiate Accept-Language so the
// canonical URL of a given page is stable for crawlers and caching. Anything the matcher excludes
// (API/admin/og/next/static/files) passes through untouched.

const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE)
// Leading non-default locale segment (e.g. /bn or /bn/…).
const NON_DEFAULT_PREFIX = new RegExp(`^/(${NON_DEFAULT_LOCALES.join('|')})(?:/|$)`)
// Leading default-locale segment (/en or /en/…).
const DEFAULT_PREFIX = new RegExp(`^/${DEFAULT_LOCALE}(?:/|$)`)
const DEFAULT_PREFIX_STRIP = new RegExp(`^/${DEFAULT_LOCALE}(?=/|$)`)

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Editor cache-buster: any page visited with ?reval=1 bounces through /next/revalidate?path=…,
  // which busts that page's tag (if the Ops Switches global allows it) and 303s back to the clean
  // URL. Handled before locale routing so it works on prefixed and unprefixed paths alike.
  if (req.nextUrl.searchParams.get('reval') === '1') {
    const url = req.nextUrl.clone()
    url.pathname = '/next/revalidate'
    url.search = `?path=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url, { status: 303 })
  }

  // Non-default locales keep their prefix and render the [locale] segment directly.
  if (NON_DEFAULT_PREFIX.test(pathname)) return NextResponse.next()

  // Legacy default-locale prefix → 301 to the unprefixed canonical (/en/about → /about, /en → /).
  if (DEFAULT_PREFIX.test(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace(DEFAULT_PREFIX_STRIP, '') || '/'
    url.search = search
    return NextResponse.redirect(url, { status: 301 })
  }

  // Unprefixed → default locale. Rewrite (URL stays unprefixed) onto the /[locale] segment so the
  // page renders as `en` without exposing the prefix.
  const url = req.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  // Run on everything EXCEPT:
  //   - /api and /admin and the Payload (payload) API (/api covers it)
  //   - /next (preview / exit-preview / seed route handlers — not locale pages)
  //   - /og (dynamic OG image route) and /_next internals
  //   - any path containing a "." (favicon.ico, robots.txt, sitemap.xml, *.css, *.woff, images…)
  // Excluding dotted paths keeps file assets out of the rewrite and off the [locale] segment.
  matcher: ['/((?!api|admin|og|next|_next|.*\\..*).*)'],
}
