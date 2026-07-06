'use client'

import Motion from '@/components/animation/motion'
import { EASE, reveal } from '@/components/animation/reveal'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Media } from '@/payload-types'
import GlobalDeliveryGlobe from './globalDeliveryGlobe'

interface GlobalDeliveryCompProps {
  heading?: string | null
  description?: RichText | string | null
  /** Legacy static map image — superseded by the interactive globe; kept for CMS compatibility. */
  image?: Media | null
  title?: string | null
  excerpt?: string | null
}

export default function GlobalDeliveryComp({ heading, description, title, excerpt }: GlobalDeliveryCompProps) {
  // Empty-state guard: nothing meaningful to render → render nothing.
  if (!heading && !description && !title && !excerpt) return null

  return (
    <section className="section-card flex flex-col gap-12 lg:gap-16">
      <Motion {...reveal} className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
        <div className="flex flex-col lg:w-2/5">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />}
        </div>

        {(excerpt || title) && (
          <div className="flex flex-col lg:w-1/4 lg:self-end">
            {excerpt && <p className="text-[12px] uppercase tracking-[0.14em] text-subtle">{excerpt}</p>}
            {title && <h3 className="mt-3 font-display text-xl font-medium text-cream lg:text-2xl">{title}</h3>}
          </div>
        )}
      </Motion>

      {/* Interactive 3D globe (lazy-loaded WebGL) highlighting the delivery hubs — replaces the
          static dotted-map SVG. Sits directly on the section surface. */}
      <Motion {...reveal} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }} className="relative w-full">
        <GlobalDeliveryGlobe />
      </Motion>
    </section>
  )
}
