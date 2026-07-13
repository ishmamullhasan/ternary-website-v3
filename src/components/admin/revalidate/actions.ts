'use server'

import { ALL_CACHE_TAGS, type CacheTag } from '@/utilities/cacheTags'
import config from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'

export type RevalidateResult = {
  ok: boolean
  tags: number
  at: string
  message?: string
}

/**
 * Server action behind the Revalidator screen (Settings → Revalidator). Clears the Data Cache for
 * just the collections/globals the editor ticked, instead of the whole site.
 *
 * `tags` is checked against ALL_CACHE_TAGS rather than trusted: server actions are callable by any
 * authenticated admin with a crafted payload, and `revalidateTag` will happily accept an arbitrary
 * string. An unknown tag is a no-op rather than a hazard, but rejecting the whole call keeps a
 * typo'd or drifted tag loud instead of silently "succeeding" while nothing gets cleared.
 *
 * Only the Data Cache is busted here (no `revalidatePath`) — every cached read of a doc carries its
 * collection/global tag, so the pages embedding it are re-rendered on next request. The full
 * route-cache sweep is reserved for `revalidateSite`.
 */
export async function revalidateTags(tags: string[]): Promise<RevalidateResult> {
  const at = new Date().toISOString()

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return { ok: false, tags: 0, at, message: 'Unauthorized' }

  if (!Array.isArray(tags) || tags.length === 0) {
    return { ok: false, tags: 0, at, message: 'Select at least one collection or global.' }
  }

  const known = new Set<string>(ALL_CACHE_TAGS)
  const unknown = tags.filter((t) => !known.has(t))
  if (unknown.length > 0) {
    return { ok: false, tags: 0, at, message: `Unknown cache tag(s): ${unknown.join(', ')}` }
  }

  for (const tag of tags as CacheTag[]) revalidateTag(tag, { expire: 0 })

  return { ok: true, tags: tags.length, at: new Date().toISOString() }
}

// Server action behind the admin "Revalidate site" button. Clears the ENTIRE site cache in one
// click: busts every content/global Data-Cache tag (see utilities/cacheTags) AND the full route
// cache under the root layout. Use after content is changed outside a normal edit — bulk imports,
// ops/seed scripts writing straight to the DB, or a stale CDN entry — where the per-doc afterChange
// revalidation didn't (or couldn't) fire.
//
// Auth: runs on the server and verifies a logged-in admin user via Payload's cookie auth, so the
// action can't be invoked by an unauthenticated caller even though it lives in the client bundle's
// action manifest.
export async function revalidateSite(): Promise<RevalidateResult> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) {
    return { ok: false, tags: 0, at: new Date().toISOString(), message: 'Unauthorized' }
  }

  for (const tag of ALL_CACHE_TAGS) revalidateTag(tag, { expire: 0 })
  // Clear the full route cache too, so pre-rendered HTML for every locale/route is regenerated.
  revalidatePath('/', 'layout')

  return { ok: true, tags: ALL_CACHE_TAGS.length, at: new Date().toISOString() }
}
