import RichTextComp, { type RichText } from '@/components/richtext'
import type { Legal } from '@/payload-types'
import config from '@/payload.config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { JSX } from 'react'

const getLegalList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.find({ collection: 'legal' })
  },
  ['legal'],
  { tags: ['legal'] },
)

function getLegalBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      return payload.find({
        collection: 'legal',
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
      })
    },
    [`legal_${slug}`],
    { tags: [`legal_${slug}`, 'legal'] },
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { docs } = await getLegalBySlug(slug)()
  const legal = docs[0]

  if (!legal) notFound()

  return {
    title: legal.title ? `${legal.title} | Ternary Solutions` : 'Ternary Solutions',
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<JSX.Element> {
  const { slug } = await params
  const { docs } = await getLegalBySlug(slug)()
  const legal: Legal | undefined = docs[0]

  if (!legal) notFound()

  return (
    <div className="flex flex-col gap-8 text-primary max-w-4xl mx-auto w-full lg:pb-24 pb-10 lg:px-0 px-4">
      <h1 className="text-4xl font-bold text-primary">{legal.title}</h1>
      <section className="space-y-4">
        <RichTextComp content={legal.content as RichText} />
      </section>
    </div>
  )
}

export async function generateStaticParams() {
  const legalList = (await getLegalList()).docs
  return legalList.map((legal) => ({ slug: legal.slug }))
}
