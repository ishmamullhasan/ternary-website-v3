import { RenderBlocks } from '@/blocks/RenderBlocks'
import { asTypedLocale } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// The home page is now a blocks-driven Page (slug `home`) rendered by <RenderBlocks>, the
// same path as every other [...slug] page. The index route ("/[locale]") can't be matched by the
// catch-all (it requires ≥1 segment), so it fetches the `home` Page directly here.
const getHomePage = async (draft: boolean, locale: TypedLocale) => {
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
  const page = await getHomePage(draft, typedLocale)

  return (
    <main>
      <RenderBlocks blocks={page?.layout} />
    </main>
  )
}
