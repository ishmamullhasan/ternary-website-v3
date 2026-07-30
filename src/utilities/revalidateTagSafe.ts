import { revalidateTag } from 'next/cache'

/**
 * `revalidateTag` that never crashes outside a Next.js request context.
 *
 * Payload `afterChange`/`afterDelete` hooks fire in two very different contexts:
 *  - a real request (admin edit, API call) — `revalidateTag` works normally; and
 *  - an out-of-request ops/seed script writing straight to the DB — where `revalidateTag`
 *    throws "Invariant: static generation store missing in revalidateTag".
 *
 * That throw is harmful: for a **global** update it aborts the write (Payload can't disable the
 * transaction cleanly for globals), so seeds silently roll back. Swallowing the out-of-request
 * throw lets those writes persist; the seed flow busts caches out-of-band (redeploy / cache-key
 * bump / the /next/revalidate endpoint) instead. In a real request this is a transparent
 * pass-through.
 */
export function revalidateTagSafe(tag: string, options?: { expire?: number }): void {
  try {
    // Cast: this repo uses the (tag, { expire }) overload from the installed Next version.
    ;(revalidateTag as (t: string, o?: { expire?: number }) => void)(tag, options)
  } catch {
    // No request context (seed/ops script) — cache invalidation happens out-of-band.
  }
}
