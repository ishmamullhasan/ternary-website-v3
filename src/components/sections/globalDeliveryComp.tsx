'use client'

import Motion from '@/components/animation/motion'
import { EASE, reveal } from '@/components/animation/reveal'
import RichTextComp, { type RichText } from '@/components/richtext'
import GlobalDeliveryGlobe, { type GlobeLane } from './globalDeliveryGlobe'

interface GlobalDeliveryCompProps {
  heading?: string | null
  description?: RichText | string | null
  /** Routes drawn on the globe, authored in the CMS. Empty → the globe's built-in Dhaka → US lanes. */
  lanes?: GlobeLane[] | null
}

export default function GlobalDeliveryComp({ heading, description, lanes }: GlobalDeliveryCompProps) {
  // Empty-state guard: nothing meaningful to render → render nothing. The globe is an illustration
  // of the copy beside it, so it never carries the section on its own.
  if (!heading && !description) return null

  return (
    // The globe is absolutely positioned, so it contributes nothing to the section's height. From lg
    // it sits beside the copy rather than below it, and the copy alone is far shorter than the
    // globe — without a floor there is nothing to hold the card open around it.
    //
    // `section-card-bleed` drops the card's own `overflow: clip` from lg up so the globe and its
    // shipping lanes read as one figure that breaks the frame, rather than a circle sliced off at
    // the card's edge. The floors below are sized so the bleed lands only where it is wanted:
    // 540px at xl leaves the lanes' highest ink 27px above the card at rest and 51px on hover,
    // inside the 72px gap to the card above; anything shorter and the lanes cross into it.
    <section className="section-card section-card-bleed relative lg:min-h-[500px] xl:min-h-[540px]">
      <Motion {...reveal} className="relative z-10 flex flex-col gap-10 lg:max-w-[52%]">
        <div className="flex flex-col">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />}
        </div>
      </Motion>

      {/* Reserves the vertical room the globe bleeds into, so it never sits under the copy.
          Roughly the globe's visible height (70% of its box) plus the arc overhang. */}
      <div aria-hidden className="h-[260px] sm:h-[320px] lg:h-16" />

      {/* Interactive 3D globe (lazy-loaded WebGL) highlighting the delivery hubs, anchored to the
          card's bottom-right corner and pushed past the right edge so it breaks the frame.
          `py-0 max-w-none` unwind the component's own centring/padding defaults, which assume it is
          laid out in flow.

          Every number here is a fraction of this box's own side, so the whole figure rescales
          together. cobe insets the sphere to 80% of its canvas, and the lanes were measured (over a
          full rotation) to reach 6.1% of the side above the canvas, stop 15% short of its right
          edge, and never cross its vertical centre. That is what the offsets are budgeted against:

            -2% up    lifts the sphere clear of the card's bottom edge — 62px at rest, 46px at the
                      hover zoom, so nothing ever spills below the card. This is what the +8% used
                      to do in reverse, when clipping hid it.
            15% right puts 26px of sphere outside the card at rest and 43px at the hover zoom. The
                      ceiling is 48px: that is the page gutter, and the card's clip margin cannot
                      exceed it without widening the document (see .section-card-bleed). Being
                      sliced by the window is no better than being sliced by the card.

          Below lg the base +8% and the card's clip both stay: the card runs nearly edge to edge
          there, so there is nowhere for a bleed to go.

          The offset lives on this plain wrapper, not on <Motion>: the shared `reveal` animates `y`,
          and motion writes that to an inline `transform`, which would overwrite the translate
          utilities. The reveal below is therefore opacity-only. */}
      <div className="absolute bottom-0 right-0 w-[300px] translate-x-[18%] translate-y-[8%] sm:w-[360px] lg:w-[480px] lg:-translate-y-[2%] lg:translate-x-[15%] xl:w-[520px]">
        <Motion
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={reveal.viewport}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        >
          <GlobalDeliveryGlobe className="max-w-none py-0" lanes={lanes} />
        </Motion>
      </div>
    </section>
  )
}
