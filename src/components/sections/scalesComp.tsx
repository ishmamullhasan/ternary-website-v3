'use client'
import Motion from '@/components/animation/motion'
import { reveal, revealItem } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import Link from '@/components/LocalizedLink'
import type { Media, Scale } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

interface SalesCompProps {
  heading?: string | null
  description?: string | null
  scales?: Scale[] | null
}

export default function SalesComp({ heading, description, scales }: SalesCompProps) {
  if (!scales || scales.length === 0) return null

  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
      {/* top header */}
      <Motion className="lg:w-2/5" {...reveal}>
        {heading ? <h2 className="text-section font-display font-medium text-cream">{heading}</h2> : null}
        {description ? <p className="mt-4 text-body">{description}</p> : null}
      </Motion>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:flex-1">
        {scales.map((item, index): JSX.Element => {
          const thumb = item.thumbnail as Media | string | null | undefined
          const mediaUrl = typeof thumb === 'object' && thumb ? thumb.url : null

          return (
            <Motion key={index} {...revealItem(index)}>
              <Link href={`/scales`} className="group block">
                {/* gradient card — the gradient IS the fallback, always rendered */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-white/[0.06] bg-ink">
                  <GradientPanel tone={toneFor(undefined, index)} interactive />

                  {/* optional CMS image layered on top of the gradient */}
                  {mediaUrl ? (
                    <Image
                      src={mediaUrl}
                      alt={item.title || 'industry'}
                      fill
                      className="relative object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : null}

                  {/* text */}
                  <div className="absolute inset-x-5 bottom-5 z-10">
                    <h3 className="font-display font-medium text-cream">{item.title}</h3>
                    {item.excerpts ? <p className="mt-1 text-sm text-body">{item.excerpts}</p> : null}
                  </div>
                </div>
              </Link>
            </Motion>
          )
        })}
      </div>
    </section>
  )
}
