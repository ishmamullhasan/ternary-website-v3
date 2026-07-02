'use server'

import { ALL_CACHE_TAGS } from '@/utilities/cacheTags'
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

  for (const tag of ALL_CACHE_TAGS) revalidateTag(tag, 'max')
  // Clear the full route cache too, so pre-rendered HTML for every locale/route is regenerated.
  revalidatePath('/', 'layout')

  return { ok: true, tags: ALL_CACHE_TAGS.length, at: new Date().toISOString() }
}
