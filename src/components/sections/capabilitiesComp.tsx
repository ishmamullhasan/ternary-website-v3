'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
import Link from '@/components/LocalizedLink'
import type { Capability, Media } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

interface CapabilitiesCompProps {
  heading?: string | null
  description?: string | null
  capability?: Capability[] | null
  heading_2?: string | null
  description_2?: string | null
  image?: Media | null
}

// Focus-visible affordance shared across every interactive element on this surface.
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

export default function CapabilitiesComp({
  heading,
  description,
  capability,
  heading_2,
  description_2,
  image,
}: CapabilitiesCompProps) {
  // Empty-state guard: the capabilities grid is the primary content of this section.
  if (!capability || capability.length === 0) return null

  return (
    <section className="section-card flex w-full flex-col gap-8">
      {/* Header — lead sentence ABOVE the display heading (Figma 339:8092), left-aligned. */}
      <Motion className="flex max-w-[544px] flex-col gap-4" {...reveal}>
        {description && <p className="text-base leading-[1.15] text-body">{description}</p>}
        {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
      </Motion>

      {/* Disciplines grid: on lg a 5-column grid whose first column is left empty (the design's
          indent), so the 8 cards occupy columns 2–5 across two 192px rows. Below lg it collapses
          to a 1/2-column stack with no gutter. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:auto-rows-[192px]">
        {/* Empty left gutter (desktop only), spanning both rows. */}
        <div aria-hidden className="hidden lg:block lg:row-span-2" />
        {capability.map((item, index): JSX.Element => {
          return (
            <Motion key={item.id ?? index} tag="div" className="h-full" {...revealItem(index)}>
              <Link
                href={`/capabilities/${item.slug}`}
                className={`group flex h-full min-h-[160px] flex-col justify-between rounded-[5px] bg-button-dark p-4 transition-colors duration-300 hover:bg-[#1a1810] ${focusRing}`}
              >
                <div>
                  <h3 className="text-[16px] font-medium leading-[1.15] text-cream">{item.title}</h3>
                  {item.excerpts && <p className="mt-2 text-[14px] leading-[1.3] text-cream/80">{item.excerpts}</p>}
                </div>
                <span className="mt-6 text-[14px] font-medium whitespace-nowrap text-cream">Explore</span>
              </Link>
            </Motion>
          )
        })}
      </div>

      {/* "Led by operators" block: left text column (lead above heading), right cream image panel
          spanning the remaining columns. */}
      {(heading_2 || description_2 || image?.url) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-4">
          <div className="flex flex-col gap-2 lg:col-span-1 lg:self-start">
            {description_2 && <p className="text-[14px] leading-[1.3] text-body">{description_2}</p>}
            {heading_2 && <h3 className="font-display text-2xl font-medium text-cream">{heading_2}</h3>}
          </div>

          {/* Cream panel — the image layers on top when present; the cream fill is the fallback. */}
          <Motion
            className="relative aspect-[16/10] w-full overflow-hidden rounded-[5px] bg-cream lg:col-span-4 lg:aspect-[11/6]"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          >
            {image?.url && (
              <Image
                src={image.url}
                alt={image.alt || heading_2 || 'leadership'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 80vw"
              />
            )}
          </Motion>
        </div>
      )}
    </section>
  )
}
