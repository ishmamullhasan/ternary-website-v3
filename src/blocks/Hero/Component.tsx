import type { HeroBlock } from '@/payload-types'

import Image from 'next/image'
import type { JSX } from 'react'

export function HeroBlockComponent({ eyebrow, heading, description, image }: HeroBlock): JSX.Element {
  const media = typeof image === 'object' && image !== null ? image : null

  return (
    <section className="max-w-7xl mx-auto px-5 py-20">
      {eyebrow && <p className="text-subtle text-sm uppercase tracking-wider mb-3">{eyebrow}</p>}
      {heading && <h1 className="text-cream text-4xl lg:text-5xl font-semibold mb-4">{heading}</h1>}
      {description && <p className="text-body text-lg max-w-2xl leading-relaxed">{description}</p>}
      {media?.url && (
        <Image
          src={media.url}
          alt={media.alt || ''}
          width={media.width || 1200}
          height={media.height || 600}
          className="mt-10 rounded-lg w-full h-auto"
          sizes="(max-width: 1024px) 100vw, 1200px"
        />
      )}
    </section>
  )
}
