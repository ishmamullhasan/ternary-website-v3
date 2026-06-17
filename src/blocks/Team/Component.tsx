import type { Media, TeamBlock } from '@/payload-types'

import Image from 'next/image'
import type { JSX } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export function TeamBlockComponent({ heading, description, members }: TeamBlock): JSX.Element {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
      {(description || heading) && (
        <div className="mb-8 lg:w-2/5">
          {description && <p className="lg:text-base text-sm mb-3 text-body">{description}</p>}
          {heading && <h2 className="lg:text-3xl text-2xl font-semibold text-white">{heading}</h2>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members?.map((member, i) => {
          if (typeof member !== 'object' || member === null) return null
          const image = typeof member.image === 'object' && member.image !== null ? (member.image as Media) : null
          return (
            <div key={i} className="relative h-[420px] rounded-xl overflow-hidden">
              {image?.url ? (
                <Image
                  src={getMediaUrl(image.url)}
                  alt={image.alt || member.name || ''}
                  width={image.width || 400}
                  height={image.height || 420}
                  className="object-cover w-full h-full"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-pink-500 via-purple-500 to-blue-500" />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-ink/90 to-transparent">
                {member.excerpt && (
                  <p className="text-white text-sm font-medium mb-4 leading-snug">&ldquo;{member.excerpt}&rdquo;</p>
                )}
                <div className="text-white text-sm font-medium">{member.name}</div>
                {member.position && <div className="text-subtle text-sm">{member.position}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
