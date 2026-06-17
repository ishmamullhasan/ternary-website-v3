import { RenderBlocks } from '@/blocks/RenderBlocks'
import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'

const queryPageBySlug = async (slug: string, draft: boolean) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    draft,
    overrideAccess: draft,
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const payload = await getPayload({ config })
  const pages = await payload.find({ collection: 'pages', limit: 1000, depth: 0, select: { slug: true } })
  return pages.docs
    .filter((page): page is typeof page & { slug: string } => Boolean(page.slug))
    .map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug(slug, draft)
  if (!page) return {}
  return { title: page.title ? `${page.title} | Ternary Solutions` : 'Ternary Solutions' }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug(slug, draft)

  if (!page) notFound()

  return (
    <main>
      <RenderBlocks blocks={page.layout} />
    </main>
  )
}
