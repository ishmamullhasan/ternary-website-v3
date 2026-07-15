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
function EngagementCard({
  item,
  index,
  aspect = 'aspect-[3/5]',
}: {
  item: Scale
  index: number
  aspect?: string
}): JSX.Element {
  const thumbnail = item.thumbnail as Media | undefined
  const url = thumbnail?.url

  return (
    <div className={`group relative w-full overflow-hidden rounded-md border border-line bg-ink ${aspect}`}>
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
    <section className="section-card flex w-full flex-col gap-8">
      {/* Header stacked above the grid, left-aligned — the Industries/Capabilities treatment. */}
      <Motion className="max-w-[544px]" {...reveal}>
        <h2 className="text-section font-display font-medium text-cream">{heading}</h2>
        {description && <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />}
      </Motion>

      {/* Mobile: horizontal snap carousel with pagination dots. */}
      <MobileCarousel slideClassName="w-[260px]">
        {model.map((item, index) => (
          <EngagementCard key={index} item={item} index={index} />
        ))}
      </MobileCarousel>

      {/* sm+ grid — hidden on mobile, where the carousel takes over. An empty left gutter (col 1 of
          5) leaves the cards in the remaining four tracks, but with only three items those split the
          right region into three columns so it fills without a trailing gap. */}
      <div className="hidden w-full gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-5">
        <div aria-hidden className="hidden lg:block" />

        <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-3">
          {model.map((item, index): JSX.Element => (
            <Motion key={index} {...revealItem(index)}>
              {/* Three tiles fill four tracks' worth of width, so they run wider than the 1-track
                  Industries/Scales tiles. Widen the aspect ratio at lg (3/5 → 4/5) so their rendered
                  height matches those blocks; sm keeps 3/5 since the tiles are the same width there. */}
              <EngagementCard item={item} index={index} aspect="aspect-[3/5] lg:aspect-[4/5]" />
            </Motion>
          ))}
        </div>
      </div>
    </section>
  )
}
