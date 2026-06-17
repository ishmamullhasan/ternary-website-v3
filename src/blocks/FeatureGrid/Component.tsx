import type { FeatureGridBlock, Media } from '@/payload-types'

import Image from 'next/image'
import type { JSX } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

const columnClass: Record<NonNullable<FeatureGridBlock['columns']>, string> = {
  '2': 'lg:grid-cols-2',
  '3': 'lg:grid-cols-3',
  '4': 'lg:grid-cols-4',
}

export function FeatureGridBlockComponent({ heading, description, items, columns }: FeatureGridBlock): JSX.Element {
  const cols = columnClass[columns ?? '3']

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
      {(description || heading) && (
        <div className="mb-8 lg:w-2/5">
          {description && <p className="lg:text-base text-sm mb-3 text-body">{description}</p>}
          {heading && <h2 className="lg:text-3xl text-2xl font-semibold text-white">{heading}</h2>}
        </div>
      )}
      <div className={`grid grid-cols-1 ${cols} gap-4`}>
        {items?.map((item, i) => {
          const image = typeof item.image === 'object' && item.image !== null ? (item.image as Media) : null
          return (
            <div key={i} className="bg-main rounded-lg p-6 flex flex-col gap-4">
              {image?.url && (
                <Image
                  src={getMediaUrl(image.url)}
                  alt={image.alt || item.title || ''}
                  width={image.width || 64}
                  height={image.height || 64}
                  className="h-12 w-12 object-contain"
                />
              )}
              {item.title && <h3 className="text-white text-lg font-semibold">{item.title}</h3>}
              {item.description && <p className="text-body text-sm leading-relaxed">{item.description}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
