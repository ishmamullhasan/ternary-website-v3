import type { LogosBlock, Media } from '@/payload-types'

import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export function LogosBlockComponent({ heading, logos }: LogosBlock): JSX.Element {
  return (
    <section className="max-w-7xl mx-auto px-5 py-12">
      {heading && <p className="text-subtle text-sm uppercase tracking-wider mb-6">{heading}</p>}
      <div className="flex flex-wrap items-center gap-8 lg:gap-12">
        {logos?.map((item, i) => {
          const icon = typeof item.icon === 'object' && item.icon !== null ? (item.icon as Media) : null
          const logo = icon?.url ? (
            <Image
              src={getMediaUrl(icon.url)}
              alt={icon.alt || item.name || ''}
              width={icon.width || 120}
              height={icon.height || 40}
              className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          ) : (
            <span className="text-body text-sm">{item.name}</span>
          )
          return item.link ? (
            <Link href={item.link} key={i}>
              {logo}
            </Link>
          ) : (
            <span key={i}>{logo}</span>
          )
        })}
      </div>
    </section>
  )
}
