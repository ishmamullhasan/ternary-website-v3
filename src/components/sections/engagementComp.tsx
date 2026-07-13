'use client'
import Motion from '@/components/animation/motion'
import { reveal, revealItem } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import MobileCarousel from '@/components/layout/MobileCarousel'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Media, Scale } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

interface EngagementCompProps {
  heading?: string | null
  // richText since the description→Lexical migration; string kept for legacy DB rows.
  description?: RichText | string | null
  model?: Scale[] | null
}

// Single engagement-model card — shared by the sm+ grid and the mobile carousel. Gradient base IS
// the fallback (always rendered); an optional CMS image layers on top.
function EngagementCard({ item, index }: { item: Scale; index: number }): JSX.Element {
  const thumbnail = item.thumbnail as Media | undefined
  const url = thumbnail?.url

  return (
    <div className="group relative aspect-[3/5] w-full overflow-hidden rounded-md border border-line bg-ink">
      <GradientPanel tone={toneFor(undefined, index)} interactive />

      {url && <Image src={url} alt={item.title || 'engagement model'} fill className="relative object-cover" />}

      {/* text */}
      <div className="absolute inset-x-4 bottom-4 z-10">
        <h3 className="font-medium text-cream">{item.title}</h3>
        <p className="mt-2 text-sm text-cream">{item.excerpts}</p>
      </div>
    </div>
  )
}

export default function EngagementComp({ heading, description, model }: EngagementCompProps) {
  if (!model?.length) return null

  return (
    <section className="section-card">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        {/* top header */}
        <Motion className="lg:w-2/5" {...reveal}>
          <h2 className="text-section font-display font-medium text-cream">{heading}</h2>
          {description && <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />}
        </Motion>

        {/* lg:flex-1 (not lg:w-auto): the cards are `w-full` inside `1fr` tracks, so a shrink-to-fit
            wrapper makes the track width depend on the card width and vice versa — it resolves to
            zero and the cards collapse to their 1px borders. flex-1 gives the tracks a definite width. */}
        <div className="w-full lg:flex-1">
          {/* Mobile: horizontal snap carousel with pagination dots. */}
          <MobileCarousel slideClassName="w-[260px]">
            {model.map((item, index) => (
              <EngagementCard key={index} item={item} index={index} />
            ))}
          </MobileCarousel>

          {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
          <div className="hidden w-full gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {model.map((item, index): JSX.Element => (
              <Motion key={index} {...revealItem(index)}>
                <EngagementCard item={item} index={index} />
              </Motion>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
