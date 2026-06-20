import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

// Ops cache-buster (WEB-457 follow-up). Content edits made outside a Next request — e.g. admin/ops
// scripts writing straight to the DB — can't fire the collections' afterChange revalidateTag(), so
// their changes stay behind Vercel's persisted Data Cache until something re-validates from a real
// request. This endpoint does exactly that: hit it after an out-of-request content change.
//
//   GET /next/revalidate?secret=<CRON_SECRET>          → revalidate all content tags
//   GET /next/revalidate?secret=<CRON_SECRET>&tag=story → revalidate a single tag
const TAGS = [
  'story',
  'insight',
  'pressRelease',
  'pages',
  'capability',
  'solution',
  'industry',
  'scale',
  'model',
  'header',
  'footer',
] as const

export async function GET(req: NextRequest): Promise<Response> {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  const single = req.nextUrl.searchParams.get('tag')
  const tags = single ? [single] : [...TAGS]
  for (const t of tags) revalidateTag(t, 'max')
  return NextResponse.json({ ok: true, revalidated: tags })
}
