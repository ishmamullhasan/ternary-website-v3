import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Payload media URLs can already carry a query string (e.g. `?prefix=...`), so a naive `?tag`
  // append would produce a malformed double-`?` URL. Pick the right separator per URL.
  const withTag = (base: string): string => (cacheTag ? `${base}${base.includes('?') ? '&' : '?'}${cacheTag}` : base)

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return withTag(url)
  }

  // Same-origin relative paths must stay relative so SSR and client hydration match.
  if (url.startsWith('/')) {
    return withTag(url)
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return withTag(`${baseUrl}${url}`)
}
