'use client'
import Motion from '@/components/animation/motion'
import { reveal, revealItem } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Media, Scale } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

interface SalesCompProps {
  heading?: string | null
  // richText since the description→Lexical migration; string kept for legacy DB rows.
  description?: RichText | string | null
  scales?: Scale[] | null
}

// Single scale card — shared by the sm+ grid and the mobile carousel. The gradient panel IS the
// fallback (always rendered); an optional CMS image layers on top.
function ScaleCard({ item, index }: { item: Scale; index: number }): JSX.Element {
  const thumb = item.thumbnail as Media | string | null | undefined
  const mediaUrl = typeof thumb === 'object' && thumb ? thumb.url : null

  return (
    <Link href={`/scales`} className="group block h-full">
      <div className="relative h-full overflow-hidden rounded-md border border-line bg-ink aspect-[3/5]">
        <GradientPanel tone={toneFor(undefined, index)} interactive />

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
  )
}

export default function SalesComp({ heading, description, scales }: SalesCompProps) {
  if (!scales || scales.length === 0) return null

  return (
    <section className="section-card flex w-full flex-col gap-8">
      {/* Header stacked above the grid, left-aligned — the Industries/Capabilities treatment. */}
      <Motion className="max-w-[544px]" {...reveal}>
        {heading ? <h2 className="text-section font-display font-medium text-cream">{heading}</h2> : null}
        {description ? (
          <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />
        ) : null}
      </Motion>

      {/* Mobile: horizontal snap carousel with pagination dots. */}
      <MobileCarousel slideClassName="w-[260px]">
        {scales.map((item, index) => (
          <ScaleCard key={index} item={item} index={index} />
        ))}
      </MobileCarousel>

      {/* sm+ grid — hidden on mobile, where the carousel takes over. Five tracks with an empty left
          gutter so the cards sit in columns 2–5, i.e. 4 per row (matching Industries). */}
      <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-5">
        <div aria-hidden className="hidden lg:block lg:row-span-2" />

        {scales.map((item, index): JSX.Element => (
          <Motion key={index} {...revealItem(index)}>
            <ScaleCard item={item} index={index} />
          </Motion>
        ))}
      </div>
    </section>
  )
}
