import { RenderBlocks } from '@/blocks/RenderBlocks'
import JsonLd from '@/components/seo/JsonLd'
import { generateMeta } from '@/lib/seo/generateMeta'
import { pagePath } from '@/lib/seo/pagePath'
import { breadcrumbList } from '@/lib/seo/structuredData'
import type { Page as PageDoc } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'

const queryPageByPath = async (segments: string[], draft: boolean): Promise<PageDoc | null> => {
  const payload = await getPayload({ config })
  const path = `/${segments.join('/')}`
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: segments[segments.length - 1] } },
    draft,
    // Pages are public, but the content collections they reference (capability, solution,
    // team, …) are not publicly readable — so with overrideAccess:false Payload returns
    // bare relationship ids instead of populating them, and block sections render empty.
    // Published pages are public content, so override access to populate relationships.
    overrideAccess: true,
    depth: 2,
    limit: 10,
  })
  // Disambiguate same-slug pages under different parents by the full breadcrumb path.
  return result.docs.find((page) => pagePath(page) === path) ?? null
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const payload = await getPayload({ config })
  const pages = await payload.find({ collection: 'pages', limit: 1000, depth: 1 })
  return pages.docs
    .map((page) => ({ slug: pagePath(page).split('/').filter(Boolean) }))
    .filter((p) => p.slug.length > 0)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageByPath(slug, draft)
  if (!page) return {}
  return generateMeta({ doc: page, pathname: pagePath(page) })
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }): Promise<JSX.Element> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageByPath(slug, draft)

  if (!page) notFound()

  // BreadcrumbList from the nested-docs breadcrumb chain (absolute urls).
  const base = getServerSideURL()
  const crumbs = (page.breadcrumbs ?? [])
    .filter((c) => c.label && c.url)
    .map((c) => ({ name: c.label as string, url: `${base}${c.url}` }))

  return (
    <main>
      {crumbs.length > 0 && <JsonLd data={breadcrumbList(crumbs)} />}
      <RenderBlocks blocks={page.layout} />
    </main>
  )
}
