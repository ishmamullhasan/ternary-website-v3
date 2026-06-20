'use client'
import Motion from '@/components/animation/motion'
import { reveal, revealItem } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import type { Media, Scale } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

interface EngagementCompProps {
  heading?: string | null
  description?: string | null
  model?: Scale[] | null
}

export default function EngagementComp({ heading, description, model }: EngagementCompProps) {
  if (!model?.length) return null

  return (
    <section>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        {/* top header */}
        <Motion className="lg:w-2/5" {...reveal}>
          <h2 className="text-section font-display font-medium text-cream">{heading}</h2>
          <p className="mt-3 text-body">{description}</p>
        </Motion>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
          {model.map((item, index): JSX.Element => {
            const thumbnail = item.thumbnail as Media | undefined
            const url = thumbnail?.url

            return (
              <Motion
                key={index}
                className="group relative aspect-[22/25] overflow-hidden rounded-md border border-white/[0.06] bg-ink"
                {...revealItem(index)}
              >
                {/* gradient base IS the fallback — always rendered */}
                <GradientPanel tone={toneFor(undefined, index)} interactive />

                {/* optional CMS media layered on top */}
                {url && (
                  <Image
                    src={url}
                    alt={item.title || 'engagement model'}
                    fill
                    className="relative object-cover"
                  />
                )}

                {/* text */}
                <div className="absolute inset-x-5 bottom-5">
                  <h3 className="font-display font-medium text-cream">{item.title}</h3>
                  <p className="mt-1 text-sm text-body">{item.excerpts}</p>
                </div>
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
