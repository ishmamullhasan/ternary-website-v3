import { RenderBlocks } from '@/blocks/RenderBlocks'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import { PAGES_EMBED_TAGS } from '@/utilities/cacheTags'
import config from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG: prebuild one static index page per locale (generateStaticParams below) and serve statically.
// Freshness is purely tag-driven (no time-based revalidate): every Payload afterChange/afterDelete
// hook busts the tags this page's cached read carries, so edits show up on the next request.

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

// The home page is a blocks-driven Page (slug `home`) rendered by <RenderBlocks>, the same path as
// every other [...slug] page. The signature hero is now the CMS `heroFeatured` block at the top of
// the home layout — previously it was a hardcoded <HeroFeatured> component fed by a live
// getHeroFeatured() query, so the thesis/headline never localized and the cards weren't editor-
// curated. Now editors own all of it. The index route ("/[locale]") can't be matched by the
// catch-all (needs ≥1 segment), so it fetches the `home` Page directly here.
const fetchHomePage = async (draft: boolean, locale: TypedLocale) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    draft,
    locale,
    // Pages are public, but the content collections they reference are not publicly
    // readable — override access so block relationships populate (else sections render empty).
    overrideAccess: true,
    depth: 2,
    limit: 1,
  })
  return result.docs[0] ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('pages')` / `revalidateTag('pages_home')` calls in the Pages afterChange hook.
// The home layout embeds docs from every content collection at depth 2 (solutions, capabilities,
// scales, team, …), so the read also carries every collection tag — editing an embedded doc busts
// this cache too, not just its own detail page. Cache key bumped (now _v4) to force a fresh read on
// this deploy so the new heroFeatured block (added to the home layout out-of-request) surfaces
// instead of a stale cached layout. (Now _v11: seed-fit-copy rewrote the aboutSection PR title +
// story/PR excerpts and the solution excerpts, all embedded here, via a direct DB write.) In draft
// mode (live preview) we bypass the cache so editors
// always see the freshest draft.
const getHomePage = (draft: boolean, locale: TypedLocale) =>
  draft
    ? fetchHomePage(true, locale)
    : unstable_cache(() => fetchHomePage(false, locale), [`pages_home_${locale}_v11`], {
        tags: [...new Set(['pages_home', ...PAGES_EMBED_TAGS])],
      })()

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const { isEnabled: draft } = await draftMode()
  const page = await getHomePage(draft, typedLocale)
  return generateMeta({ doc: page, pathname: '/', locale: typedLocale })
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { isEnabled: draft } = await draftMode()
  const page = await getHomePage(draft, typedLocale)

  return (
    <div>
      <RenderBlocks blocks={page?.layout} />
    </div>
  )
}
