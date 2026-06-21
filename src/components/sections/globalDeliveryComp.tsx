'use client'

import Motion from '@/components/animation/motion'
import { EASE, reveal } from '@/components/animation/reveal'
import type { Media } from '@/payload-types'
import Image from 'next/image'

interface GlobalDeliveryCompProps {
  heading?: string | null
  description?: string | null
  image?: Media | null
  title?: string | null
  excerpt?: string | null
}

export default function GlobalDeliveryComp({ heading, description, image, title, excerpt }: GlobalDeliveryCompProps) {
  // Empty-state guard: nothing meaningful to render (no copy, no media) → render nothing.
  if (!heading && !description && !title && !excerpt && !image?.url) return null

  return (
    <section className="flex flex-col gap-12 lg:gap-16">
      {/* Header — single left-aligned column: description first, heading below (Figma 339:8145). */}
      <Motion {...reveal} className="flex max-w-xl flex-col">
        {description && <p className="text-body">{description}</p>}
        {heading && <h2 className="mt-4 text-section font-display font-medium text-cream">{heading}</h2>}
      </Motion>

      {/* World map — full-bleed dotted map on the page surface (no card border / gradient backdrop),
          with the talent-refinery label stacked above it (Figma 339:8149/8153). */}
      <Motion {...reveal} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }} className="flex flex-col gap-8">
        {(excerpt || title) && (
          <div className="flex max-w-[238px] flex-col gap-2">
            {excerpt && <p className="text-sm text-body">{excerpt}</p>}
            {title && <p className="text-2xl font-display font-medium text-cream">{title}</p>}
          </div>
        )}

        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {image?.url && (
            <Image
              src={image.url}
              alt={image.alt || heading || 'Global delivery'}
              fill
              className="relative object-cover"
            />
          )}
          <Image
            src="/globalDelivery.svg"
            alt="Global delivery network"
            width={1356}
            height={763}
            className="relative h-full w-full object-contain"
          />
        </div>
      </Motion>
    </section>
  )
}
