import RichTextComp, { type RichText } from '@/components/richtext'
import type { Insight, Media, PressRelease, Story } from '@/payload-types'
import config from '@/payload.config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'

type ContentCollection = 'story' | 'insight' | 'pressRelease'

type ContentDoc = Story | Insight | PressRelease

const COLLECTION_CONFIG: Record<ContentCollection, { label: string; listPath: string; tag: string }> = {
  story: { label: 'Case Study', listPath: '/stories', tag: 'story' },
  insight: { label: 'Thought Piece', listPath: '/stories', tag: 'insight' },
  pressRelease: { label: 'Press Release', listPath: '/stories', tag: 'pressRelease' },
}

function getDocBySlug(collection: ContentCollection, slug: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      })
      return (result.docs[0] as ContentDoc | undefined) ?? null
    },
    [`${collection}_${slug}`],
    { tags: [`${collection}_${slug}`, COLLECTION_CONFIG[collection].tag] },
  )
}

function getListPath(collection: ContentCollection): string {
  return COLLECTION_CONFIG[collection].listPath
}

function getDetailPath(collection: ContentCollection, slug: string): string {
  switch (collection) {
    case 'story':
      return `/stories/${slug}`
    case 'insight':
      return `/insights/${slug}`
    case 'pressRelease':
      return `/press-release/${slug}`
  }
}

export function createContentDetailPage(collection: ContentCollection) {
  async function generateStaticParams() {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection,
      limit: 100,
      depth: 0,
    })

    return result.docs.map((doc) => ({
      slug: doc.slug,
    }))
  }

  async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const doc = await getDocBySlug(collection, slug)()

    if (!doc?.title) return {}

    return {
      title: `${doc.title} | Ternary Solutions`,
      description: doc.excerpts ?? undefined,
    }
  }

  async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
    const { slug } = await params
    const doc = await getDocBySlug(collection, slug)()

    if (!doc) notFound()

    const thumbnail = doc.thumbnail as Media | undefined
    const { label, listPath } = COLLECTION_CONFIG[collection]

    return (
      <div className="max-w-4xl mx-auto w-full px-4 lg:px-0 py-12 lg:py-20 text-primary">
        <Link href={listPath} className="text-sm text-[#757571] hover:text-white transition-colors mb-8 inline-block">
          ← Back to stories
        </Link>

        <div className="space-y-6 mb-10">
          <span className="inline-flex items-center rounded-full border border-zinc-700/60 bg-[#14120B] px-4 py-2 text-xs text-[#D5D5D5]">
            {label}
          </span>
          <h1 className="text-3xl lg:text-5xl font-medium tracking-tight text-white leading-tight">{doc.title}</h1>
          {doc.excerpts && <p className="text-base text-[#D5D5D5] leading-relaxed max-w-2xl">{doc.excerpts}</p>}
        </div>

        {thumbnail?.url && (
          <div className="relative w-full h-[280px] lg:h-[420px] rounded-lg overflow-hidden mb-10">
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt || doc.title || label}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {doc.content && (
          <div className="prose prose-invert max-w-none">
            <RichTextComp content={doc.content as RichText} />
          </div>
        )}
      </div>
    )
  }

  return { Page, generateMetadata, generateStaticParams, getDetailPath }
}

export { getDetailPath }
