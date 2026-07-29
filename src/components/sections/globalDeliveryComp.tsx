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
    // it sits beside the copy rather than below it.
    //
    // `section-card-bleed` widens the card's own clip from lg up so the globe and its shipping
    // lanes read as one figure that breaks the frame, rather than a circle sliced off at the card's
    // edge — top and sides only; the base stays flush.
    //
    // The floors are the CARD's height, not the globe's. The globe used to be anchored to the
    // bottom, so the card had to be tall enough to hold it — 540px, against copy that runs 431px
    // with its spacer, which left a band of empty card under the text. It is anchored to the top
    // now, so the card is free to be sized by its own content and the sphere's base is simply
    // cropped by it.
    <section className="section-card section-card-bleed relative lg:min-h-[440px] xl:min-h-[456px]">
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
          card's top-right corner and pushed past the right edge so it breaks the frame.
          `py-0 max-w-none` unwind the component's own centring/padding defaults, which assume it is
          laid out in flow.

          Every number here is a fraction of this box's own side, so the whole figure rescales
          together. cobe insets the sphere to 80% of its canvas, and the lanes were measured (over a
          full rotation) to reach 6.1% of the side above the canvas, stop 15% short of its right
          edge, and never cross its vertical centre. That is what the offsets are budgeted against:

            top, +2%  anchors the figure to the card's TOP. Its position is then fixed against the
                      heading and cannot drift when the card's height changes — which matters
                      because the card is now shorter than the sphere is tall, so the sphere's base
                      is cropped by the card's bottom edge. That is the one edge the bleed does not
                      open (see .section-card-bleed). Anchored to the bottom, as it was, shortening
                      the card would have slid the whole figure up instead of cropping it.
            15% right puts 26px of sphere outside the card at rest and 43px at the hover zoom. The
                      ceiling is 48px: that is the page gutter, and the card's clip margin cannot
                      exceed it without widening the document (see .section-card-bleed). Being
                      sliced by the window is no better than being sliced by the card.

          Below lg the base +8% and the card's clip both stay: the card runs nearly edge to edge
          there, so there is nowhere for a bleed to go.

          The offset lives on this plain wrapper, not on <Motion>: the shared `reveal` animates `y`,
          and motion writes that to an inline `transform`, which would overwrite the translate
          utilities. The reveal below is therefore opacity-only. */}
      <div className="absolute bottom-0 right-0 w-[300px] translate-x-[18%] translate-y-[8%] sm:w-[360px] lg:top-0 lg:bottom-auto lg:w-[480px] lg:translate-x-[15%] lg:translate-y-[2%] xl:w-[520px]">
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
