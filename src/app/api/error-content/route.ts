import { LOCALES } from '@/lib/i18n/locales'
import { getErrorPage } from '@/utilities/getGlobals'
import { NextResponse } from 'next/server'
import type { TypedLocale } from 'payload'

// Public read-only copy for the error screens. It exists because Next requires error boundaries to
// be Client Components, so error.tsx / global-error.tsx cannot call the Payload local API the way
// not-found.tsx does — and Payload's own REST globals endpoint is access-locked (403).
//
// Lives at top-level /api so the [locale] middleware matcher (which excludes /api) leaves it alone,
// and so Payload's /api/[...slug] catch-all doesn't claim it.
//
// Every locale is returned in one response: the client picks by URL. Editable marketing copy only —
// nothing here is sensitive.
//
// Defensive by design: this is consumed by a screen that only renders when something is ALREADY
// broken. If the DB is the thing that is down, we must not turn a rendered error page into a second
// failure — so a read error returns 200 with `{}` and the client falls back to its baked-in copy.
export async function GET() {
  try {
    const docs = await Promise.all(LOCALES.map((locale) => getErrorPage(locale as TypedLocale)))
    const content = Object.fromEntries(LOCALES.map((locale, i) => [locale, docs[i]]))

    return NextResponse.json(content, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store' } })
  }
}
