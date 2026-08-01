import { CapabilitiesHubComponent } from '@/blocks/CapabilitiesHub/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
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
 * Capabilities hub (CMS build-out 2026-08-01). The landing is now a CMS-authored Page (slug
 * `capabilities`, normally a single `capabilitiesHub` block) rendered through RenderBlocks — same
 * path as /solutions. If no such doc exists yet, the block component renders with its built-in
 * fallback content (the previous hardcoded copy), so this route can never 404 or render empty.
 */

export const metadata: Metadata = {
  title: 'Capabilities — Every discipline. One standard.',
  description:
    'The technical practices behind everything Ternary builds and runs — each with a named lead, house standards, and work in production.',
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

const fetchPage = async (draft: boolean, locale: TypedLocale) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'capabilities' } },
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
    : unstable_cache(() => fetchPage(false, locale), [`pages_capabilities_${locale}_v1`], {
        tags: [...new Set(['pages_capabilities', ...PAGES_EMBED_TAGS])],
      })()

export default async function CapabilitiesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { isEnabled: draft } = await draftMode()
  const page = await getPage(draft, typedLocale)

  if (!page?.layout?.length) return <CapabilitiesHubComponent />

  return <RenderBlocks blocks={page.layout} locale={typedLocale} slug="capabilities" />
}
