import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
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
