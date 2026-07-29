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
        {/* lg guard: reserve + clamp 3 lines (text-sm leading-5) so Frame/Flow/Orchestra keep one
            text-block height — excerpts are budgeted to the 105–126ch band (3 lines at lg). */}
        <p className="mt-2 text-sm text-cream lg:line-clamp-3 lg:min-h-[4.29em]">{item.excerpts}</p>
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

      {/* sm+ grid — hidden on mobile, where the carousel takes over. FOUR tracks for three
          cards, matching every other card section on the page; the fourth is left empty.

          This replaced a 5-track wrapper whose first track was an empty gutter and whose
          remaining four were re-split into three by a nested grid. The effect was a block
          1002px wide inside a 1257px page, indented from every heading above it and with
          tiles at their own private width. One flat grid, one gap, same tracks as
          everything else. */}
      <div className="hidden w-full gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {model.map((item, index): JSX.Element => (
          /* The empty track sits at the FRONT, so the row ends flush with the section's right
             edge. lg only — below that the tiles are two-up and an offset would strand one. */
          <Motion key={index} {...revealItem(index)} className={index === 0 ? 'lg:col-start-2' : undefined}>
            {/* A FIXED height at lg, not a ratio. Both this and the Scales tile are now one
                track wide, but a ratio scales with the track and a floor does not — so they
                only agreed at exactly 1440px and drifted everywhere else (324px at 1280,
                391px at 1920, against Scales' constant 374). Same mechanism, same number,
                so the two sections stay level at every width. The ratio stays below lg,
                where the tiles are two-up and there is no Scales row to match. */}
            <EngagementCard item={item} index={index} aspect="aspect-[3/5] lg:aspect-auto lg:h-[374px]" />
          </Motion>
        ))}
      </div>
    </section>
  )
}
