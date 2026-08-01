import { IndustriesHubComponent } from '@/blocks/IndustriesHub/Component'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { PAGES_EMBED_TAGS } from '@/utilities/cacheTags'
import config from '@payload-config'
import type { IndustriesHubBlock } from '@/payload-types'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

/**
 * Industries hub (CMS build-out 2026-08-01). The landing is now a CMS-authored Page (slug
 * `industries`, normally a single `industriesHub` block). Unlike the other hubs this renders the
 * block component DIRECTLY rather than through RenderBlocks: its `.hub` layout is full-bleed with
 * its own `.wrap` gutters, so the shared RenderBlocks container (max-width + gutters) would fight
 * it. If no doc/block exists yet, the component renders its built-in fallback content (the previous
 * hardcoded copy), so this route can never 404 or render empty.
 */

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!asTypedLocale(locale)) return {}
  return {
    title: 'Industries',
    description:
      'We build where the stakes are specific — sectors where the rules, the risk, and the vocabulary are specific, with named work behind them.',
  }
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

const fetchPage = async (draft: boolean, locale: TypedLocale) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'industries' } },
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
    : unstable_cache(() => fetchPage(false, locale), [`pages_industries_${locale}_v1`], {
        tags: [...new Set(['pages_industries', ...PAGES_EMBED_TAGS])],
      })()

export default async function IndustriesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const { isEnabled: draft } = await draftMode()
  const page = await getPage(draft, typedLocale)

  const block = page?.layout?.find((b) => b.blockType === 'industriesHub') as IndustriesHubBlock | undefined

  return <IndustriesHubComponent {...(block ?? {})} />
}
