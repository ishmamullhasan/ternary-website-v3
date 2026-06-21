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
    <section className="flex flex-col gap-10 rounded-lg bg-main p-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12 lg:px-9 lg:py-12">
      {/* top header — description sits above the heading, matching Figma 339:8125 */}
      <Motion className="lg:w-2/5" {...reveal}>
        {description ? <p className="text-body">{description}</p> : null}
        {heading ? <h2 className="mt-4 text-section font-display font-medium text-cream">{heading}</h2> : null}
      </Motion>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:flex-1">
        {scales.map((item, index): JSX.Element => {
          const thumb = item.thumbnail as Media | string | null | undefined
          const mediaUrl = typeof thumb === 'object' && thumb ? thumb.url : null

          return (
            <Motion key={index} {...revealItem(index)}>
              <Link href={`/scales`} className="group block">
                {/* gradient card — the gradient IS the fallback, always rendered */}
                <div className="relative aspect-[268/296] overflow-hidden rounded-md border border-line bg-ink">
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

                  {/* bottom-to-transparent scrim keeps the card text legible over imagery */}
                  <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-transparent to-black/70" />

                  {/* text */}
                  <div className="absolute inset-x-4 bottom-4 z-10">
                    <h3 className="font-medium text-cream">{item.title}</h3>
                    {item.excerpts ? <p className="mt-2 text-sm text-cream">{item.excerpts}</p> : null}
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
