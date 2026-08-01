import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ScalesHubComponent } from '@/blocks/ScalesHub/Component'
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
 * Scales hub (CMS build-out 2026-08-01). The landing is now a CMS-authored Page (slug `scales`,
 * normally a single `scalesHub` block) rendered through RenderBlocks — same path as /solutions.
 * If no such doc exists yet, the block component renders with its built-in fallback content (the
 * previous hardcoded copy), so this route can never 404 or render empty.
 */

export const metadata: Metadata = {
  title: 'Scales — From founding teams to national institutions.',
  description:
    "Our quality bar doesn't change with your size — the shape of the work does. One engineering standard, held from a startup's first product to a national institution.",
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

const fetchPage = async (draft: boolean, locale: TypedLocale) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'scales' } },
    draft,
    locale,
    overrideAccess: true,
    depth: 2,
    limit: 1,
  })
  return result.docs[0] ?? null
}

const getPage = (draft: boolean, locale: TypedLocale) =>
  draft
    ? fetchPage(true, locale)
    : unstable_cache(() => fetchPage(false, locale), [`pages_scales_${locale}_v1`], {
        tags: [...new Set(['pages_scales', ...PAGES_EMBED_TAGS])],
      })()

export default async function ScalesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { isEnabled: draft } = await draftMode()
  const page = await getPage(draft, typedLocale)

  if (!page?.layout?.length) return <ScalesHubComponent />

  return <RenderBlocks blocks={page.layout} locale={typedLocale} slug="scales" />
}
