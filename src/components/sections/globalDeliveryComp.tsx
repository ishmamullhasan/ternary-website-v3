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
    // it sits beside the copy rather than below it, and the copy alone is shorter than the globe's
    // visible slice (80% of its box: ~450px at lg, ~530px at xl) — without a floor the card clips it.
    <section className="section-card relative lg:min-h-[500px] xl:min-h-[580px]">
      <Motion {...reveal} className="relative z-10 flex flex-col gap-10 lg:max-w-[52%]">
        <div className="flex flex-col">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />}
        </div>
      </Motion>

      {/* Reserves the vertical room the globe bleeds into, so it never sits under the copy.
          Roughly the globe's visible height (80% of its box) plus the arc overhang. */}
      <div aria-hidden className="h-[300px] sm:h-[370px] lg:h-16" />

      {/* Interactive 3D globe (lazy-loaded WebGL) highlighting the delivery hubs. It is anchored to
          the card's bottom-right corner and pushed past both edges by a fraction of its own size —
          20% horizontally, 20% vertically — so the visible slice is the top-left 80% × 80% of the
          sphere. `.section-card` is `overflow: clip`, which does the cropping. `py-0 max-w-none`
          unwind the component's own centring/padding defaults, which assume it is laid out in flow.

          The offset lives on this plain wrapper, not on <Motion>: the shared `reveal` animates `y`,
          and motion writes that to an inline `transform`, which would overwrite the translate
          utilities. The reveal below is therefore opacity-only. */}
      <div className="absolute bottom-0 right-0 w-[340px] translate-x-[20%] translate-y-[20%] sm:w-[420px] lg:w-[560px] xl:w-[660px]">
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
