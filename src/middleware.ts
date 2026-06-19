import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Always-prefixed [locale] routing (WEB-445).
//
// Every public page lives under /[locale] (/en/…, /bn/…). This middleware 301-redirects any
// unprefixed / legacy URL to the default-locale-prefixed equivalent:
//   /            → /en
//   /about       → /en/about
//   /insights/x  → /en/insights/x
//
// The default locale is DETERMINISTIC ('en'); we deliberately do NOT negotiate Accept-Language so
// the canonical URL of a given page is stable for crawlers and caching. Already-prefixed paths and
// anything the matcher excludes (API/admin/static/preview/files) pass through untouched.

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(?:/|$)`)

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Already locale-prefixed → nothing to do.
  if (LOCALE_PREFIX.test(pathname)) return NextResponse.next()

  // Prefix with the default locale and 301. Root '/' becomes '/en'.
  const url = req.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`
  url.search = search
  return NextResponse.redirect(url, { status: 301 })
}

export const config = {
  // Run on everything EXCEPT:
  //   - /api and /admin and the Payload (payload) API (/api covers it)
  //   - /next (preview / exit-preview / seed route handlers — not locale pages)
  //   - /_next internals
  //   - any path containing a "." (favicon.ico, robots.txt, sitemap.xml, *.css, *.woff, images…)
  // Excluding dotted paths keeps file assets out of the redirect and off the [locale] segment.
  matcher: ['/((?!api|admin|og|next|_next|.*\\..*).*)'],
}
