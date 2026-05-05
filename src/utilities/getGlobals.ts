import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (slug: Global, depth = 0) =>
  unstable_cache(async () => getGlobal(slug, depth), [slug, String(depth)], {
    tags: [`global_${slug}`],
  })

/**
 * Fetches header global without caching (revalidate: 0).
 * Use depth: 1 to populate logo media with URL.
 */
export async function getHeader() {
  return getGlobal('header', 1)
}

/**
 * Fetches footer global without caching (revalidate: 0).
 * Use depth: 1 to populate logo media with URL.
 */
export async function getFooter() {
  return getGlobal('footer', 1)
}

/**
 * Fetches homepage global without caching (revalidate: 0).
 * Use depth: 1 to populate media (hero image, icons, etc.).
 */
export async function getHomepage() {
  return getGlobal('homepage' as Global, 1)
}
