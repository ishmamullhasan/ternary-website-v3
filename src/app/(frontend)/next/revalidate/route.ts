import { LOCALES } from '@/lib/i18n/locales'
import { ALL_CACHE_TAGS } from '@/utilities/cacheTags'
import config from '@payload-config'
import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

// Ops cache-buster (WEB-457 follow-up). Content edits made outside a Next request — e.g. admin/ops
// scripts writing straight to the DB — can't fire the collections' afterChange revalidateTag(), so
// their changes stay behind Vercel's persisted Data Cache until something re-validates from a real
// request. This endpoint does exactly that: hit it after an out-of-request content change.
//
//   GET /next/revalidate?secret=<CRON_SECRET>          → revalidate all content tags
//   GET /next/revalidate?secret=<CRON_SECRET>&tag=story → revalidate a single tag
//   GET /next/revalidate?path=/about                    → editor mode (no secret): bust that page's
//     tag with IMMEDIATE expiry and bounce back to the page, so the very next render is fresh.
//     Gated by the "Allow ?reval=1" checkbox in the Ops Switches global (middleware redirects
//     /about?reval=1 here). When the toggle is off this is a silent no-op redirect.

export async function GET(req: NextRequest): Promise<Response> {
  const path = req.nextUrl.searchParams.get('path')
  if (path !== null) {
    // Only same-site absolute paths — never redirect off-origin.
    if (!path.startsWith('/') || path.startsWith('//')) {
      return NextResponse.json({ ok: false, message: 'Bad path' }, { status: 400 })
    }
    const back = new URL(path, req.nextUrl.origin)

    const payload = await getPayload({ config })
    const ops = await payload.findGlobal({ slug: 'ops' })
    if (!ops?.queryRevalidation) {
      return NextResponse.redirect(back, { status: 303, headers: { 'x-reval': 'off' } })
    }

    // Tag = last path segment, minus any leading locale prefix; "/" (or a bare locale) is home.
    const segments = path.split('/').filter(Boolean)
    if (LOCALES.includes(segments[0] as (typeof LOCALES)[number])) segments.shift()
    const slug = segments[segments.length - 1] ?? 'home'
    // expire:0 expires the entry immediately, so the redirected request already renders fresh. Every
    // revalidateTag on the site now uses this rather than the `'max'` stale-while-revalidate profile
    // — SWR hands the *stale* copy to the next reader and only refreshes behind them, which defeats
    // both this redirect and the live-refresh poller (WEB-490).
    revalidateTag(`pages_${slug}`, { expire: 0 })
    return NextResponse.redirect(back, { status: 303, headers: { 'x-reval': `pages_${slug}` } })
  }

  const secret = req.nextUrl.searchParams.get('secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  const single = req.nextUrl.searchParams.get('tag')
  const tags = single ? [single] : [...ALL_CACHE_TAGS]
  for (const t of tags) revalidateTag(t, { expire: 0 })
  return NextResponse.json({ ok: true, revalidated: tags })
}
