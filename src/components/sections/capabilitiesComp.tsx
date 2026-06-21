'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
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
    <section className="w-full">
      <div className="flex flex-col gap-8 rounded-lg bg-main px-6 py-12 lg:px-9">
        {/* top header */}
        <Motion className="max-w-[544px]" {...reveal}>
          {description && <p className="mb-4 text-base text-body">{description}</p>}
          <h2 className="text-section font-display font-medium text-cream">{heading}</h2>
        </Motion>

        {/* capabilities grid: the left rail is held empty (col-1) on desktop so the cards
            align to the right of the header, matching the Figma 5-column layout. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {capability.map((item, index): JSX.Element => {
            return (
              <Motion
                key={item.id ?? index}
                tag="div"
                className={`group flex flex-col justify-between rounded-md bg-button-dark p-4 transition-colors duration-300 hover:bg-badge ${index === 0 ? 'lg:col-start-2' : ''}`}
                {...revealItem(index)}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium text-cream">{item.title}</h3>
                  {item.excerpts && <p className="text-sm text-body">{item.excerpts}</p>}
                </div>
                <Link
                  href={`/capabilities/${item.slug}`}
                  className={`mt-6 inline-flex items-center rounded-sm text-sm font-medium text-cream transition-colors hover:text-subtle ${focusRing}`}
                >
                  Explore
                </Link>
              </Motion>
            )
          })}
        </div>

        {/* leadership section */}
        {(heading_2 || description_2 || image?.url) && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:items-start lg:gap-12">
            <div className="lg:col-span-1">
              {description_2 && <p className="text-sm text-body">{description_2}</p>}
              {heading_2 && <h3 className="mt-3 font-display text-2xl font-medium text-cream">{heading_2}</h3>}
            </div>

            {/* Always-rendered gradient base; the optional CMS image layers on top when present. */}
            <Motion
              className="group relative aspect-[1100/600] w-full overflow-hidden rounded-md ring-1 ring-white/[0.06] lg:col-span-4"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            >
              <GradientPanel tone={toneFor(undefined, 1)} interactive />
              {image?.url && (
                <Image
                  src={image.url}
                  alt={image.alt || 'leadership'}
                  fill
                  className="object-cover relative"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                />
              )}
            </Motion>
          </div>
        )}
      </div>
    </section>
  )
}
