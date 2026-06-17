import type { Media, RelationGridBlock } from '@/payload-types'

import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

// All target collections share these display fields; read them through a narrow shape.
type CardDoc = {
  title?: string | null
  excerpts?: string | null
  slug?: string | null
  thumbnail?: number | Media | null
}

const columnClass: Record<NonNullable<RelationGridBlock['columns']>, string> = {
  '2': 'lg:grid-cols-2',
  '3': 'lg:grid-cols-3',
  '4': 'lg:grid-cols-4',
}

export function RelationGridBlockComponent({
  heading,
  description,
  items,
  columns,
  hrefBase,
}: RelationGridBlock): JSX.Element {
  const cols = columnClass[columns ?? '3']

  return (
    <section className="bg-main lg:p-10 m-4 lg:m-0 p-4 rounded-lg">
      {(description || heading) && (
        <div className="lg:mb-12 mb-4 lg:w-2/5">
          {description && <p className="lg:text-base text-sm mb-3 text-body">{description}</p>}
          {heading && <h2 className="lg:text-3xl text-2xl font-semibold text-white">{heading}</h2>}
        </div>
      )}

      <div className={`grid grid-cols-1 ${cols} gap-3 lg:gap-4`}>
        {items?.map((item, i) => {
          const doc = (typeof item.value === 'object' && item.value !== null ? item.value : null) as CardDoc | null
          if (!doc) return null

          const media = typeof doc.thumbnail === 'object' && doc.thumbnail !== null ? doc.thumbnail : null
          const href = hrefBase && doc.slug ? `${hrefBase.replace(/\/$/, '')}/${doc.slug}` : hrefBase

          const card = (
            <div className="relative h-[300px] rounded-lg overflow-hidden">
              {media?.url ? (
                <Image
                  src={getMediaUrl(media.url)}
                  alt={media.alt || doc.title || ''}
                  width={media.width || 280}
                  height={media.height || 300}
                  className="object-cover w-full h-full"
                  sizes="(max-width: 1024px) 100vw, 280px"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-pink-500 via-purple-500 to-blue-500" />
              )}
              <div className="absolute top-5 left-5 right-5">
                <h3 className="lg:text-base text-sm font-semibold text-white">{doc.title}</h3>
                {doc.excerpts && <p className="lg:text-sm text-xs text-body">{doc.excerpts}</p>}
              </div>
            </div>
          )

          return href ? (
            <Link href={href} key={i}>
              {card}
            </Link>
          ) : (
            <div key={i}>{card}</div>
          )
        })}
      </div>
    </section>
  )
}
