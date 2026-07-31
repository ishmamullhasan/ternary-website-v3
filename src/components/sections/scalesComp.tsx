'use client'
import Motion from '@/components/animation/motion'
import { reveal, revealItem } from '@/components/animation/reveal'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import ScaleFigure from '@/components/scales/ScaleFigure'
import SectionCta from '@/components/sections/SectionCta'
import type { Scale } from '@/payload-types'
import type { JSX } from 'react'

interface SalesCompProps {
  heading?: string | null
  // richText since the description→Lexical migration; string kept for legacy DB rows.
  description?: RichText | string | null
  scales?: Scale[] | null
}

// Single scale card — shared by the sm+ grid and the mobile carousel. The figure states the card's
// claim on its own; the title and excerpt sit beneath it. Replaces the gradient panel, which was
// the same ornament three times over and said nothing about any individual scale.
//
// The 374px floor plus a flexed figure area is what keeps the three cards a matched set whatever
// length the CMS excerpts run to: the copy takes the height it needs, the figure absorbs the rest.
// 374 rather than 372 so these land on exactly the same height as the Methods tiles, which are
// ratio-driven (4/5 of a 299px track = 373.75) rather than floored. Same width, same height.
function ScaleCard({ item, index }: { item: Scale; index: number }): JSX.Element {
  return (
    <Link href="/scales" className="group block h-full rounded-md">
      <div className="sc-card flex h-full min-h-[374px] flex-col justify-between overflow-hidden rounded-md border border-transparent bg-ink p-5 transition-colors duration-300 group-hover:border-line">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <ScaleFigure title={item.title} index={index} />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-[17px] font-medium leading-[1.2] tracking-[-0.045em] text-cream">{item.title}</h3>
          {/* Resting colour is --color-body (#aaaaaa, AAA 7:1) — the design's cream/55 would fail
              the AAA floor for body text. Hover lifts it to cream.
              lg guard (kept from main): reserve + clamp 3 lines so the 3-up row's bottom-anchored
              text blocks match. min-h is 4.5em here — 3 lines at this leading-[1.5], not the 4.29em
              that suited the previous leading-5. */}
          {item.excerpts ? (
            <p className="text-sm leading-[1.5] tracking-[-0.03em] text-body transition-colors duration-[600ms] group-hover:text-cream lg:line-clamp-3 lg:min-h-[4.5em]">
              {item.excerpts}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export default function SalesComp({ heading, description, scales }: SalesCompProps) {
  if (!scales || scales.length === 0) return null

  return (
    /* lg+: one row on the section's 4-track rhythm — the header takes the first track (where an
       empty spacer track used to sit) and the three cards fill the rest, so the copy and the
       figures read as a single line and the section loses the whole header band of height
       (owner direction 2026-07-31). Below lg the header stacks above the cards as before. */
    <section className="section-card flex w-full flex-col gap-8 lg:grid lg:grid-cols-4 lg:items-stretch lg:gap-5">
      {/* Header — left-aligned; below lg the hub link sits top-right, level with the h2's first
          line; at lg it drops beneath the copy inside the narrow first column. */}
      <Motion
        className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 lg:flex-col lg:justify-start lg:gap-7"
        {...reveal}
      >
        <div className="max-w-[544px]">
          {heading ? <h2 className="text-section font-display font-medium text-cream">{heading}</h2> : null}
          {description ? (
            <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />
          ) : null}
        </div>
        <SectionCta href="/scales" destination="about the scales we work at" />
      </Motion>

      {/* Mobile: horizontal snap carousel with pagination dots. */}
      <MobileCarousel slideClassName="w-[260px]">
        {scales.map((item, index) => (
          <ScaleCard key={index} item={item} index={index} />
        ))}
      </MobileCarousel>

      {/* sm+ grid — hidden on mobile, where the carousel takes over. Three tracks inside the
          section's last three columns: same card width as the old empty-track layout, without
          the empty track. */}
      <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
        {scales.map((item, index): JSX.Element => (
          <Motion key={index} {...revealItem(index)}>
            <ScaleCard item={item} index={index} />
          </Motion>
        ))}
      </div>
    </section>
  )
}
