import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload, type TypedLocale } from 'payload'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0, locale?: TypedLocale) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return global
}

/**
 * Fetches header global without caching (revalidate: 0).
 * Use depth: 1 to populate logo media with URL.
 * Pass `locale` to localize; omit to use Payload's defaultLocale.
 */
export async function getHeader(locale?: TypedLocale) {
  return getGlobal('header', 1, locale)
}

/**
 * Fetches footer global without caching (revalidate: 0).
 * Use depth: 1 to populate logo media with URL.
 * Pass `locale` to localize; omit to use Payload's defaultLocale.
 */
export async function getFooter(locale?: TypedLocale) {
  return getGlobal('footer', 1, locale)
}
