import Heading from '@/components/a11y/Heading'
import MobileCarousel from '@/components/layout/MobileCarousel'
import RichTextComp, { type RichText } from '@/components/richtext'
import { InsightImageCard, InsightWideCard, normalizeInsight } from '@/components/sections/stories/cards'
import type { Insight, InsightsListBlock } from '@/payload-types'
import type { JSX } from 'react'

/**
 * Insights list block — the section heading followed by the insights bento (image cards, with
 * every fifth card widening to a two-column accent). The card markup is the exact one the stories
 * archive uses for its insights band, so the two grids stay visually identical.
 *
 * Self-wraps in its own <section> (registered in RenderBlocks' SELF_WRAPPED_BLOCKS) to avoid a
 * second section/fade wrapper — matching `storiesArchive`.
 */
export const InsightsListComponent = (data: InsightsListBlock): JSX.Element => {
  // Depth-resolved relationships arrive as populated docs; unresolved ids (or slug-less drafts) are
  // dropped so a card never links nowhere.
  const insights = (data.items ?? []).filter(
    (item): item is Insight => typeof item === 'object' && item !== null && Boolean(item.slug),
  )
  const cards = insights.map((doc, index) => normalizeInsight(doc, index))

  return (
    <section className="w-full">
      {(data.heading || data.description) && (
        <div className="mb-6 flex max-w-[724px] flex-col gap-4">
          {data.heading && (
            <Heading
              level={2}
              className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-medium leading-[1.15] tracking-[-0.05em] text-cream opacity-90"
            >
              {data.heading}
            </Heading>
          )}
          {data.description && (
            <RichTextComp
              content={data.description as RichText}
              className="opacity-90 prose-p:mb-0 prose-p:text-base prose-p:font-normal prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-body"
            />
          )}
        </div>
      )}

      {cards.length > 0 ? (
        <>
          {/* Mobile: horizontal snap carousel — every insight renders as the normal card. */}
          <MobileCarousel slideClassName="w-[280px]">
            {cards.map((item, index) => (
              <InsightImageCard key={item.id} item={item} index={index} />
            ))}
          </MobileCarousel>

          {/* sm+ bento grid — hidden on mobile, where the carousel takes over. */}
          <div className="hidden gap-4 sm:grid md:grid-cols-2 lg:grid-cols-3">
            {cards.map((item, index) =>
              index % 5 === 4 ? (
                <InsightWideCard key={item.id} item={item} index={index} />
              ) : (
                <InsightImageCard key={item.id} item={item} index={index} />
              ),
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-md border border-line bg-main py-16 text-center">
          <p className="text-base tracking-[-0.01em] text-cream">Nothing here yet.</p>
          <p className="max-w-sm text-sm tracking-[-0.01em] text-subtle">New insights will appear here.</p>
        </div>
      )}
    </section>
  )
}

export default InsightsListComponent
