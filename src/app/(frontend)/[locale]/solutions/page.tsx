import { RenderBlocks } from '@/blocks/RenderBlocks'
import { SolutionsHubComponent } from '@/blocks/SolutionsHub/Component'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { PAGES_EMBED_TAGS } from '@/utilities/cacheTags'
import config from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

/**
 * Solutions hub (Phase 1 CMS build-out). The landing is now a CMS-authored Page (slug `solutions`,
 * normally a single `solutionsHub` block) rendered through RenderBlocks — same path as home. If no
 * such doc exists yet, the block component renders with its built-in fallback content (the
 * previous hardcoded copy), so this route can never 404 or render empty during rollout.
 */

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'Ways to work with Ternary — build something new, modernize what you have, extend your team, or hand us the keys to production. One engineering standard behind all of them.',
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

const fetchSolutionsPage = async (draft: boolean, locale: TypedLocale) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'solutions' } },
    draft,
    locale,
    overrideAccess: true,
    depth: 2,
    limit: 1,
  })
  return result.docs[0] ?? null
}

const getSolutionsPage = (draft: boolean, locale: TypedLocale) =>
  draft
    ? fetchSolutionsPage(true, locale)
    : unstable_cache(() => fetchSolutionsPage(false, locale), [`pages_solutions_${locale}_v1`], {
        tags: [...new Set(['pages_solutions', ...PAGES_EMBED_TAGS])],
      })()

export default async function SolutionsHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { isEnabled: draft } = await draftMode()
  const page = await getSolutionsPage(draft, typedLocale)

  // No CMS doc yet → the block's built-in fallback copy (the original hardcoded page).
  if (!page?.layout?.length) return <SolutionsHubComponent />

  return <RenderBlocks blocks={page.layout} locale={typedLocale} slug="solutions" />
}
