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
    // bottom, so the card had to be tall enough to hold it. It is anchored to the top now, so the
    // card is free to be sized by its own content — copy plus padding is 367px at xl — and the
    // sphere's base is simply cropped by it. 400px leaves a measured band under the copy rather
    // than the ~110px the old bottom-anchored floor forced.
    <section className="section-card section-card-bleed relative lg:min-h-[440px] xl:min-h-[400px]">
      <Motion {...reveal} className="relative z-10 flex flex-col gap-10 lg:max-w-[52%]">
        <div className="flex flex-col">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />}
        </div>
      </Motion>

      {/* Reserves the vertical room the globe bleeds into, so it never sits under the copy —
          which is only a concern below lg, where the globe sits BELOW the text rather than beside
          it. From lg the copy is capped at 52% width and the globe is off to the right, so the
          spacer is pure dead height there and the card's floor sets the breathing room instead. */}
      <div aria-hidden className="h-[260px] sm:h-[320px] lg:h-0" />

      {/* Interactive 3D globe (lazy-loaded WebGL) highlighting the delivery hubs, anchored to the
          card's top-right corner and pushed past the right edge so it breaks the frame.
          `py-0 max-w-none` unwind the component's own centring/padding defaults, which assume it is
          laid out in flow.

          Every number here is a fraction of this box's own side, so the whole figure rescales
          together. cobe insets the sphere to 80% of its canvas, and the lanes were measured (over a
          full rotation) to reach 6.1% of the side above the canvas, stop 15% short of its right
          edge, and never cross its vertical centre. That is what the offsets are budgeted against:

            top, -3%  anchors the figure to the card's TOP. Its position is then fixed against the
                      heading and cannot drift when the card's height changes — which matters
                      because the card is shorter than the sphere is tall, so the sphere's base is
                      cropped by the card's bottom edge. That is the one edge the bleed does not
                      open (see .section-card-bleed). Anchored to the bottom, as it was, shortening
                      the card would have slid the whole figure up instead of cropping it.

                      -3% puts the sphere's crown 36px below the card's top edge. It cannot go
                      much higher: the lanes reach 6.1% of the box above the sphere's canvas, which
                      at this offset is already 47px above the card against a hard 48px ceiling.
                      That ceiling is the page gutter and cannot be raised — a wider clip margin
                      widens the document, and clip-path does not claw it back (measured).
            15% right puts 26px of sphere outside the card at rest and 43px at the hover zoom. The
                      ceiling is 48px: that is the page gutter, and the card's clip margin cannot
                      exceed it without widening the document (see .section-card-bleed). Being
                      sliced by the window is no better than being sliced by the card.

          Below lg the base +8% and the card's clip both stay: the card runs nearly edge to edge
          there, so there is nowhere for a bleed to go.

          The offset lives on this plain wrapper, not on <Motion>: the shared `reveal` animates `y`,
          and motion writes that to an inline `transform`, which would overwrite the translate
          utilities. The reveal below is therefore opacity-only. */}
      <div className="absolute bottom-0 right-0 w-[300px] translate-x-[18%] translate-y-[8%] sm:w-[360px] lg:top-0 lg:bottom-auto lg:w-[480px] lg:translate-x-[15%] lg:-translate-y-[3%] xl:w-[520px]">
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
