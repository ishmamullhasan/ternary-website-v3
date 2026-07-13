import { readContentVersion } from '@/utilities/liveContent'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

// Live-refresh poll endpoint (WEB-490). Returns the current content version — a millisecond
// timestamp stamped into the DB by the afterChange/afterDelete hooks the liveRefresh plugin injects
// into every public collection and global.
//
//   GET /next/live  →  { "v": 1752374400000 }
//
// The <LiveRefresh /> client component polls this and calls router.refresh() whenever `v` moves,
// which is what makes an already-open tab pick up a publish without anyone reloading it.
//
// force-dynamic + no-store are both load-bearing: a cached response here would report a stale
// version forever and the refresh would never fire. This is the one route on the site that must
// never be cached by Next, Vercel's CDN, or the browser.
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const payload = await getPayload({ config })
  const v = await readContentVersion(payload)

  return NextResponse.json({ v }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
}
