import { RenderBlocks } from '@/blocks/RenderBlocks'
import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// The home page is now a blocks-driven Page (slug `home`) rendered by <RenderBlocks>, the
// same path as every other [...slug] page. The index route ("/") can't be matched by the
// catch-all (it requires ≥1 segment), so it fetches the `home` Page directly here.
const getHomePage = async (draft: boolean) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    draft,
    // Pages are public, but the content collections they reference are not publicly
    // readable — override access so block relationships populate (else sections render empty).
    overrideAccess: true,
    depth: 2,
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const page = await getHomePage(draft)
  return { title: page?.title ? `${page.title} | Ternary Solutions` : 'Ternary Solutions' }
}

export default async function Page(): Promise<JSX.Element> {
  const { isEnabled: draft } = await draftMode()
  const page = await getHomePage(draft)

  return (
    <main>
      <RenderBlocks blocks={page?.layout} />
    </main>
  )
}
