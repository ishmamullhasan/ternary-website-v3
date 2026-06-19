import { RenderBlocks } from '@/blocks/RenderBlocks'
import type { FeaturedItem } from '@/components/sections/heroFeatured'
import HeroFeatured from '@/components/sections/heroFeatured'
import { asTypedLocale } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import config from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// The home page is now a blocks-driven Page (slug `home`) rendered by <RenderBlocks>, the
// same path as every other [...slug] page. The index route ("/[locale]") can't be matched by the
// catch-all (it requires ≥1 segment), so it fetches the `home` Page directly here.
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

// Featured "work stream" cards for the signature hero. Pulls the most recent published case
// studies, insights, and press releases and keys each to a content-type gradient. Gradients are
// CSS, so missing media never breaks the hero. overrideAccess mirrors the page query (content
// collections aren't publicly readable, but these are already-published, surfaced items).
const getHeroFeatured = async (locale: TypedLocale): Promise<FeaturedItem[]> => {
  const payload = await getPayload({ config })
  // No explicit _status filter: outside draft mode payload.find already returns published docs,
  // and not every content collection carries _status — filtering on it dropped all stories.
  const q = { depth: 0 as const, locale, overrideAccess: true }
  const [storyRes, insightRes, pressRes] = await Promise.all([
    // Story limit is generous so the hero still fills 8 cards from real case studies while
    // insights/press are still placeholder scaffolding (those lanes contribute when populated).
    payload.find({ collection: 'story', limit: 8, ...q }).catch(() => null),
    payload.find({ collection: 'insight', limit: 3, ...q }).catch(() => null),
    payload.find({ collection: 'pressRelease', limit: 2, ...q }).catch(() => null),
  ])

  type Surfaceable = { slug?: string | null; title?: string | null }
  const p = (s: string) => `/${locale}${s}`
  // Skip scaffolding placeholders so the hero only showcases real, titled content: a doc must have
  // a slug + title, and the title can't be a bare default ("Title"/"Untitled"). Filtering display,
  // not deleting — a genuinely-titled doc is never hidden.
  const PLACEHOLDER = /^(title|untitled)(\s*\d+)?$/i
  const named = (docs: Surfaceable[] | undefined) =>
    (docs ?? []).filter((d) => d.slug && d.title && !PLACEHOLDER.test(d.title.trim()))
  // Rotate through the full tone palette so an all-case-study hero (insights/press still scaffolding)
  // keeps its gradient variety instead of clustering on two tones.
  const STORY_TONES = ['crimson', 'violet', 'emerald', 'azure', 'magenta', 'indigo'] as const
  const storyItems: FeaturedItem[] = named(storyRes?.docs).map((d, i) => ({
    title: d.title as string,
    category: 'Case Study',
    href: p(`/stories/${d.slug}`),
    tone: STORY_TONES[i % STORY_TONES.length],
  }))
  const insightItems: FeaturedItem[] = named(insightRes?.docs).map((d, i) => ({
    title: d.title as string,
    category: 'Insight',
    href: p(`/insights/${d.slug}`),
    tone: i % 2 ? 'indigo' : 'violet',
  }))
  const pressItems: FeaturedItem[] = named(pressRes?.docs).map((d) => ({
    title: d.title as string,
    category: 'Press Release',
    href: p(`/press-release/${d.slug}`),
    tone: 'emerald',
  }))

  // Interleave so the grid alternates content types and gradient tones rather than clustering.
  const ordered: FeaturedItem[] = []
  const lanes = [storyItems, insightItems, pressItems]
  for (let i = 0; ordered.length < 8 && lanes.some((l) => l[i]); i++) {
    for (const lane of lanes) if (lane[i] && ordered.length < 8) ordered.push(lane[i])
  }
  return ordered.slice(0, 8)
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('pages')` / `revalidateTag('pages_home')` calls in the Pages afterChange hook.
// In draft mode (live preview) we bypass the cache so editors always see the freshest draft.
const getHomePage = (draft: boolean, locale: TypedLocale) =>
  draft
    ? fetchHomePage(true, locale)
    : unstable_cache(() => fetchHomePage(false, locale), [`pages_home_${locale}_v2`], {
        tags: ['pages', 'pages_home'],
        revalidate: 300,
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
  const [page, featured] = await Promise.all([getHomePage(draft, typedLocale), getHeroFeatured(typedLocale)])

  // The signature hero replaces the legacy first block (the old "Engineering for enduring impact"
  // hero); the remaining CMS blocks render unchanged beneath it.
  const restBlocks = page?.layout?.slice(1)

  return (
    <main>
      <HeroFeatured items={featured} />
      <RenderBlocks blocks={restBlocks} />
    </main>
  )
}
