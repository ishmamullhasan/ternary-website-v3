import { CONTENT_TAGS } from '@/utilities/cacheTags'
import { bumpContentVersion } from '@/utilities/liveContent'
import { revalidateTag } from 'next/cache'
import type { CollectionConfig, GlobalConfig, PayloadRequest, Plugin } from 'payload'

/**
 * Live-refresh plugin (WEB-490). Appends an afterChange/afterDelete hook to every collection and
 * global that renders on the public site, stamping a new content version so open browser tabs can
 * detect the write and re-render themselves. See utilities/liveContent.ts for the mechanism.
 *
 * This is a plugin, and registered LAST in the plugins array, rather than a hook added to each
 * config by hand, for two reasons:
 *
 *  1. Coverage without drift. Adding a collection to payload.config no longer means remembering to
 *     wire it up — it gets the bump automatically. A hook we have to remember is a hook we will
 *     eventually forget.
 *  2. It reaches the collections *other plugins* create. `forms` (formBuilderPlugin) is embedded
 *     into cached page reads by the `contactForm` block, but it never had a revalidation hook, so
 *     editing a form left every page embedding it serving the old copy indefinitely. A plugin
 *     running after formBuilderPlugin sees that collection; the static `collections: [...]` array in
 *     payload.config does not.
 */

// Collections that must NOT bump. `analytics` is the load-bearing one: it takes a row per pageview,
// so bumping there would make the site refresh itself on every visit — an infinite loop, since each
// refresh is itself a pageview. The rest are auth/ops/internal tables that never render.
const NO_BUMP = new Set([
  'analytics',
  // Audit rows are written on every CMS write (plugins/activityLog.ts). Bumping here would mean
  // every log row — including the one recording a purely internal write — triggers a site-wide
  // refresh and busts the `pages` tag, for content that never renders publicly.
  'activityLog',
  'users',
  'search', // written by searchPlugin on every source save — the source's own bump already covers it
  'form-submissions',
  'payload-folders',
  'payload-jobs',
  'payload-locked-documents',
  'payload-preferences',
  'payload-migrations',
])

// Globals with no public read (`revalidator` is a UI-only shell with no data at all).
const NO_BUMP_GLOBALS = new Set(['revalidator'])

// Collections that already revalidate their own cache tags in a hand-written hook. `media` isn't in
// CONTENT_TAGS but busts every tag itself (collections/media.ts). Anything NOT in this set is a
// collection nobody tagged — it can still reach the public site by being embedded in a page layout
// (that's `forms`), so bust `pages` for it.
const SELF_TAGGING = new Set<string>([...CONTENT_TAGS, 'media'])

// `{ expire: 0 }`, not the `'max'` stale-while-revalidate profile the hand-written hooks used to
// use: SWR serves the *stale* entry to the next reader and only then refreshes in the background,
// which means the router.refresh() our own poller triggers would paint the pre-edit content. Expiry
// has to be immediate for the first render after a publish to be the new one.
const EXPIRE_NOW = { expire: 0 } as const

const withLiveHooks = (collection: CollectionConfig): CollectionConfig => {
  if (NO_BUMP.has(collection.slug)) return collection

  // afterChange and afterDelete have different argument types, so they can't share one hook value —
  // but both only need `req`, so the body is identical.
  //
  const bump = ({ req }: { req: PayloadRequest }) => {
    void bumpContentVersion(req.payload)
    if (SELF_TAGGING.has(collection.slug)) return
    try {
      revalidateTag('pages', EXPIRE_NOW)
    } catch {
      // Out-of-request write. The doc is saved; the Data Cache still needs the Revalidator screen or
      // GET /next/revalidate to catch up, exactly as it did before this plugin existed.
    }
  }

  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      // PREPENDED, not appended. Outside a Next request — which is how everything in scripts/ writes
      // — the hand-written revalidateTag hooks throw ("static generation store missing"), and a hook
      // that throws takes the rest of the chain with it. Running last would mean never running at
      // all for exactly the writes that most need a signal.
      afterChange: [bump, ...(collection.hooks?.afterChange ?? [])],
      afterDelete: [bump, ...(collection.hooks?.afterDelete ?? [])],
    },
  }
}

const withLiveHooksGlobal = (global: GlobalConfig): GlobalConfig => {
  if (NO_BUMP_GLOBALS.has(global.slug)) return global

  return {
    ...global,
    hooks: {
      ...global.hooks,
      // Prepended for the same reason as the collection hooks above.
      afterChange: [
        ({ req }) => {
          void bumpContentVersion(req.payload)
        },
        ...(global.hooks?.afterChange ?? []),
      ],
    },
  }
}

export const liveRefreshPlugin: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map(withLiveHooks),
  globals: config.globals?.map(withLiveHooksGlobal),
})

export default liveRefreshPlugin
