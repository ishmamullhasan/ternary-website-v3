'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import Link from '@/components/LocalizedLink'
import type { Capability, Media } from '@/payload-types'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
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
      {/* top header */}
      <Motion className="max-w-2xl" {...reveal}>
        <p className="mb-3 text-[12px] uppercase tracking-[0.14em] text-subtle">Capabilities</p>
        <h2 className="text-section font-display font-medium text-cream">{heading}</h2>
        {description && <p className="mt-3 max-w-xl text-body">{description}</p>}
      </Motion>

      {/* capabilities grid */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:mt-14">
        {capability.map((item, index): JSX.Element => {
          return (
            <Motion
              key={item.id ?? index}
              tag="div"
              className="group flex flex-col rounded-md border border-white/[0.06] bg-ink p-5 transition-colors duration-300 hover:border-line-strong"
              {...revealItem(index)}
            >
              <h3 className="font-display font-medium text-cream">{item.title}</h3>
              {item.excerpts && <p className="mt-2 flex-1 text-sm text-body">{item.excerpts}</p>}
              <Link
                href={`/capabilities/${item.slug}`}
                className={`mt-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-cream transition-colors hover:text-subtle ${focusRing}`}
              >
                Explore
                <ArrowUpRight
                  size={15}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                  aria-hidden
                />
              </Link>
            </Motion>
          )
        })}
      </div>

      {/* leadership section */}
      {(heading_2 || description_2 || image?.url) && (
        <div className="mt-16 grid grid-cols-1 gap-8 lg:mt-24 lg:grid-cols-3 lg:items-start lg:gap-12">
          <div className="lg:col-span-1">
            {heading_2 && (
              <h3 className="font-display font-medium text-cream text-2xl">{heading_2}</h3>
            )}
            {description_2 && <p className="mt-3 text-body">{description_2}</p>}
          </div>

          {/* Always-rendered gradient base; the optional CMS image layers on top when present. */}
          <Motion
            className="group relative aspect-[1100/600] w-full overflow-hidden rounded-md ring-1 ring-white/[0.06] lg:col-span-2"
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
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            )}
          </Motion>
        </div>
      )}
    </section>
  )
}
