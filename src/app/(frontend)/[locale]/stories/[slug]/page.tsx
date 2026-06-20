import { toneFor } from '@/components/sections/stories/gradient'
import StoryDetail, { type RelatedStoryCardData } from '@/components/sections/stories/StoryDetail'
import { asTypedLocale, localizedPath } from '@/lib/i18n/locales'
import type { Story } from '@/payload-types'
import config from '@/payload.config'
import { createContentDetailPage } from '@/utilities/contentDetailPage'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG + ISR: prebuild known slugs (generateStaticParams below) and serve them statically, then
// revalidate every 5 minutes. dynamicParams lets slugs not in the prebuilt set render on demand.
export const revalidate = 300
export const dynamicParams = true

// Reuse the shared metadata + static-params generators; the page body is bespoke for stories.
const { generateMetadata, generateStaticParams } = createContentDetailPage('story')

function formatDate(date?: string | null): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getStory(slug: string, locale: TypedLocale) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'story',
        where: { slug: { equals: slug } },
        locale,
        limit: 1,
        depth: 2,
      })
      return (result.docs[0] as Story | undefined) ?? null
    },
    [`story_detail_${slug}_${locale}`],
    { tags: [`story_${slug}`, 'story'] },
  )
}

function getRelatedStories(excludeSlug: string, locale: TypedLocale) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'story',
        where: { slug: { not_equals: excludeSlug } },
        locale,
        limit: 3,
        depth: 1,
      })
      return result.docs as Story[]
    },
    [`story_related_${excludeSlug}_${locale}`],
    { tags: ['story'] },
  )
}

async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()

  const story = await getStory(slug, typedLocale)()
  if (!story) notFound()

  const relatedDocs = await getRelatedStories(slug, typedLocale)()
  const related: RelatedStoryCardData[] = relatedDocs.map((doc, index) => ({
    href: localizedPath(typedLocale, `/stories/${doc.slug}`),
    title: doc.title ?? 'Untitled',
    excerpt: doc.excerpts,
    code: (doc as { code?: string | null }).code ?? null,
    date: formatDate((doc as { publishedDate?: string | null }).publishedDate),
    readTime: null,
    categoryLabel: 'Case Study',
    tone: toneFor('story', index),
  }))

  return <StoryDetail story={story} backHref={localizedPath(typedLocale, '/stories')} related={related} />
}

export { generateMetadata, generateStaticParams }
export default Page
