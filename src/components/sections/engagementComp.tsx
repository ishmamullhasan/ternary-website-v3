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
      <div className="flex flex-col gap-8 rounded-lg bg-main p-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12 lg:px-9 lg:py-12">
        {/* top header — description sits above the heading, matching Figma 339:8141 */}
        <Motion className="lg:w-2/5" {...reveal}>
          <p className="text-body">{description}</p>
          <h2 className="mt-3 text-section font-display font-medium text-cream">{heading}</h2>
        </Motion>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
          {model.map((item, index): JSX.Element => {
            const thumbnail = item.thumbnail as Media | undefined
            const url = thumbnail?.url

            return (
              <Motion
                key={index}
                className="group relative aspect-[22/25] overflow-hidden rounded-md border border-line bg-ink"
                {...revealItem(index)}
              >
                {/* gradient base IS the fallback — always rendered */}
                <GradientPanel tone={toneFor(undefined, index)} interactive />

                {/* optional CMS media layered on top */}
                {url && (
                  <Image src={url} alt={item.title || 'engagement model'} fill className="relative object-cover" />
                )}

                {/* bottom-darkening scrim keeps the card text legible over imagery */}
                <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/[0.56] to-transparent" />

                {/* text */}
                <div className="absolute inset-x-4 bottom-4 z-10">
                  <h3 className="font-medium text-cream">{item.title}</h3>
                  <p className="mt-2 text-sm text-cream">{item.excerpts}</p>
                </div>
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
