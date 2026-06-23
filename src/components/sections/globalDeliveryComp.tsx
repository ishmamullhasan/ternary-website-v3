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
    <section className="section-card flex flex-col gap-12 lg:gap-16">
      <Motion {...reveal} className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
        <div className="flex flex-col lg:w-2/5">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && <p className="mt-4 text-body">{description}</p>}
        </div>

        {(excerpt || title) && (
          <div className="flex flex-col lg:w-1/4 lg:self-end">
            {excerpt && <p className="text-[12px] uppercase tracking-[0.14em] text-subtle">{excerpt}</p>}
            {title && <h3 className="mt-3 font-display text-xl font-medium text-cream lg:text-2xl">{title}</h3>}
          </div>
        )}
      </Motion>

      {/* Globe on a transparent backdrop — no gradient/grain panel behind it. The optional CMS image
          (if present) and the static globe svg sit directly on the section surface. */}
      <Motion {...reveal} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }} className="relative w-full">
        <div className="relative aspect-[11/6] w-full">
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
            width={1100}
            height={600}
            className="relative h-full w-full object-contain p-6 lg:p-10"
          />
        </div>
      </Motion>
    </section>
  )
}
