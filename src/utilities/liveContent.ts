import type { Payload } from 'payload'

/**
 * Live refresh (WEB-490) — the client-side half of tag-based ISR.
 *
 * `revalidateTag` only clears Next's Data Cache on the *server*. A browser tab that is already open
 * has no idea a publish happened and keeps showing the HTML it rendered, until the visitor navigates
 * or reloads. That is the gap this file closes: every content write stamps a single monotonic
 * "content version" into the DB, the /next/live route hands that number to the browser, and the
 * <LiveRefresh /> client component polls it and calls router.refresh() when it moves.
 *
 * Why the DB and not a module-level variable: in production the admin write and the poll request are
 * served by different serverless instances, so in-process state is invisible across them. One tiny
 * upsert per save + one projected findOne per poll is the cheapest durable signal available.
 *
 * This is written with the raw Mongo driver rather than the Local API on purpose — a Payload
 * collection would fire its own hooks (recursing straight back into this bump) and would show up as
 * an editable collection in the admin nav. The raw driver also bypasses mongoose's `strict` schema
 * filtering, which silently drops writes to paths a schema doesn't declare.
 */

const VERSION_COLLECTION = 'content-version'
const VERSION_ID = 'singleton'

// payload.db is typed against the adapter interface, which doesn't expose the mongoose connection.
type MongoDb = {
  connection?: {
    collection: (name: string) => {
      updateOne: (
        filter: Record<string, unknown>,
        update: Record<string, unknown>,
        options?: Record<string, unknown>,
      ) => Promise<unknown>
      findOne: (filter: Record<string, unknown>, options?: Record<string, unknown>) => Promise<{ v?: unknown } | null>
    }
  }
}

const versionCollection = (payload: Payload) =>
  (payload.db as unknown as MongoDb).connection?.collection(VERSION_COLLECTION)

/**
 * Stamp a new content version. Called from the injected afterChange/afterDelete hooks (see
 * plugins/liveRefresh.ts) on every collection and global that renders on the public site.
 *
 * Deliberately never throws: a failed bump costs an editor one manual refresh, whereas letting it
 * reject would fail the save itself. The same reasoning is why callers may fire it without awaiting.
 */
export async function bumpContentVersion(payload: Payload): Promise<void> {
  try {
    await versionCollection(payload)?.updateOne({ _id: VERSION_ID }, { $set: { v: Date.now() } }, { upsert: true })
  } catch (err) {
    payload.logger.warn({ err }, 'live-refresh: failed to bump content version')
  }
}

/** Current content version, or 0 if nothing has been written yet. */
export async function readContentVersion(payload: Payload): Promise<number> {
  try {
    const doc = await versionCollection(payload)?.findOne({ _id: VERSION_ID }, { projection: { v: 1 } })
    return typeof doc?.v === 'number' ? doc.v : 0
  } catch {
    return 0
  }
}

/**
 * Auth.js (payload-authjs) session cookies. Presence of one of these means "an editor is probably
 * looking at this tab", which is all the layout needs in order to decide whether to ship the
 * <LiveRefresh /> poller. `__Secure-` is the prefix Auth.js uses over HTTPS.
 *
 * This is a cheap cookie-presence check, NOT authentication — it costs no DB round-trip, and the
 * worst case (a stale or forged cookie) is that a visitor polls a route which returns a single
 * integer that leaks nothing. Anything the poller triggers (`router.refresh()`) re-renders the same
 * public page they could already load. Real authorization still happens in Payload, untouched.
 */
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token', 'payload-token'] as const

export function hasEditorSession(cookieNames: string[]): boolean {
  return cookieNames.some((name) => (SESSION_COOKIES as readonly string[]).includes(name))
}
