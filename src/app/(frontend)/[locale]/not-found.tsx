import NotFoundComp, { type NotFoundContentMap } from '@/components/sections/notFoundComp'
import { LOCALES } from '@/lib/i18n/locales'
import { getNotFound } from '@/utilities/getGlobals'
import type { TypedLocale } from 'payload'

// Must stay a Server Component. Marking this boundary `'use client'` makes Next skip it and render
// its builtin 404 shell instead — the header, footer, and the whole design vanish, with no error
// logged.
//
// It also receives no `params`, and `en` is served unprefixed, so there is no server-side signal for
// the active locale. Hence: read the 404 global for EVERY locale here, hand the map to NotFoundComp,
// and let it pick the one matching the URL. Both reads are cached under the `not-found` tag, so this
// is two cache hits, not two DB round-trips.
export default async function NotFound() {
  const docs = await Promise.all(LOCALES.map((locale) => getNotFound(locale as TypedLocale)))
  const content = Object.fromEntries(LOCALES.map((locale, i) => [locale, docs[i]])) as NotFoundContentMap

  return <NotFoundComp content={content} />
}
