import { getServerSideURL } from '@/utilities/getURL'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

// First-party pageview ingest (WEB-447). Lives at top-level /api/track so the WEB-445 [locale]
// middleware matcher (which excludes /api) leaves it alone — no locale redirect.
//
// Contract: POST JSON { path, locale?, referrer? } from the client beacon. We write one analytics
// row via the local API with overrideAccess (the collection's create access is staff-only). This
// endpoint is intentionally cheap and defensive: it never throws to the client and ALWAYS returns
// 204, so a logging failure can never break a page or surface an error to a visitor.

// Cap stored field lengths so a hostile/oversized payload can't bloat the collection.
const MAX_PATH = 512
const MAX_LOCALE = 16
const MAX_REFERRER = 1024
const MAX_UA = 512

const clamp = (value: unknown, max: number): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : undefined
}

// Cheap bot filter: empty/non-string paths, obvious crawler UAs, and anything that isn't a
// root-relative path. We only ever store our own first-party page paths.
const BOT_UA = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|monitor|preview|fetch/i

const noContent = () => new NextResponse(null, { status: 204 })

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Same-origin sanity check: the beacon is fired from our own pages, so the referer/origin
    // header should match our site. This is a best-effort guard, not auth — missing headers are
    // tolerated (some browsers omit them on sendBeacon), but a foreign origin is rejected.
    const siteOrigin = new URL(getServerSideURL()).origin
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    const sourceOrigin = origin ?? (referer ? safeOrigin(referer) : null)
    if (sourceOrigin && sourceOrigin !== siteOrigin) return noContent()

    const userAgent = req.headers.get('user-agent') ?? ''
    if (BOT_UA.test(userAgent)) return noContent()

    const body = (await req.json().catch(() => null)) as { path?: unknown; locale?: unknown; referrer?: unknown } | null
    if (!body) return noContent()

    // Path must be a non-empty, root-relative string. Anything else is noise/abuse → drop silently.
    const path = clamp(body.path, MAX_PATH)
    if (!path || !path.startsWith('/')) return noContent()

    const payload = await getPayload({ config })
    await payload.create({
      collection: 'analytics',
      overrideAccess: true, // create access is staff-only; the public beacon writes via this bypass.
      data: {
        path,
        locale: clamp(body.locale, MAX_LOCALE),
        referrer: clamp(body.referrer, MAX_REFERRER),
        userAgent: clamp(userAgent, MAX_UA),
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    // Swallow everything — analytics must never affect the visitor's request.
  }
  return noContent()
}

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}
