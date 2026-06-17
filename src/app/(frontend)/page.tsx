import { RenderBlocks } from '@/blocks/RenderBlocks'
import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// The homepage now renders the `home` Page (blocks), migrated from the old homePage global.
const queryHome = async (draft: boolean) => {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    draft,
    overrideAccess: draft,
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode()
  const page = await queryHome(isEnabled)
  return { title: page?.title ? `${page.title} | Ternary Solutions` : 'Ternary Solutions' }
}

export default async function Page(): Promise<JSX.Element> {
  const { isEnabled } = await draftMode()
  const page = await queryHome(isEnabled)
  if (!page) notFound()

  return (
    <main>
      <RenderBlocks blocks={page.layout} />
    </main>
  )
}
