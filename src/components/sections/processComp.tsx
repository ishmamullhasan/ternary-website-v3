import ProcessFigure from '@/components/process/ProcessFigure'
import ProcessStory from '@/components/process/ProcessStory'
import type { RichText } from '@/components/richtext'
import RichTextComp from '@/components/richtext'
import type { JSX } from 'react'

interface ProcessCompProps {
  heading?: string | null
  description?: RichText | string | null
  process?:
    | {
        number?: string | null
        title?: string | null
        description?: RichText | null
      }[]
    | null
}

/**
 * "How we operate" — a pinned storytelling stage: one operating principle on screen at a
 * time, changing as the section is scrolled through.
 *
 * Replaces a rail-and-list, and before that a 2-up grid. The list still asked the reader
 * to scan five headlines at once; this presents one idea, holds it, then hands over.
 *
 * The five step descriptions were empty in the CMS, which is what left the earlier
 * versions of this section looking half empty. They are filled now by
 * scripts/set-process-descriptions.ts — DRAFTS, written to be replaced, claiming nothing
 * specific. The slot still renders only when authored, so clearing one in the admin
 * degrades cleanly rather than leaving a gap.
 *
 * Left holds the frame and the figure, centred against the stage. Right is the stage.
 * ProcessStory owns the state; processStory.css owns the pin, the crossfade, and the
 * fallback that keeps all five readable without JavaScript or under reduced motion.
 */
export default function ProcessComp({ heading, description, process }: ProcessCompProps) {
  // Empty-state guard: with no steps there is nothing to render, so collapse the section
  // entirely and let the parent RenderBlocks rhythm own the surrounding spacing.
  if (!process || process.length === 0) return null

  const steps = process
  const longest = steps.reduce((a, s) => ((s.title ?? '').length > a.length ? (s.title ?? '') : a), '')

  return (
    <ProcessStory count={steps.length}>
      <div className="ps-pin section-card">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16">
          {/* Frame — centred against the stage rather than top-aligned, so the composition
              stays balanced when only one principle is showing. */}
          <div className="flex flex-col gap-5">
            <p className="text-[12px] font-medium tracking-[0.14em] text-subtle uppercase">Process</p>
            {(heading || description) && (
              <div>
                {heading && <h2 className="font-display text-section text-cream">{heading}</h2>}
                {description && (
                  <RichTextComp
                    content={description as RichText}
                    className="prose-p:mb-0 prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-body max-w-md"
                  />
                )}
              </div>
            )}

            {/* Smaller than before, and it reacts: courses already read stay solid, the live
                one is bright, the rest recede. */}
            <div className="mt-1 hidden w-full max-w-[248px] lg:block">
              <ProcessFigure count={steps.length} plateClass="ps-plate" />
            </div>
          </div>

          {/* The stage, set flush RIGHT. The figure anchors the left edge of the card and the
              narrative the right, so the two ends of the composition are pinned and the space
              opens in the middle rather than trailing off one side. `ml-auto` on the capped
              blocks does the pushing; `text-right` turns the ragged edge inward to meet it. */}
          <div>
            <div className="ps-stage">
              {/* Holds the stage open at the tallest slide's height so nothing jumps as the
                  copy changes length. Hidden from sight and from screen readers — the real
                  slides below carry the content. */}
              <div aria-hidden className="ps-sizer text-right">
                <h3 className="font-display ml-auto text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em]">
                  {longest}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed">
                  &nbsp;
                  <br />
                  &nbsp;
                </p>
              </div>

              {steps.map((item, index): JSX.Element => (
                <article key={index} className="ps-slide items-end text-right">
                  {item.title && (
                    <h3 className="font-display ml-auto max-w-[20ch] text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-cream">
                      {item.title}
                    </h3>
                  )}
                  {/* Renders only when authored, so clearing one in the admin leaves no gap. */}
                  {item.description && (
                    <div className="mt-4 ml-auto max-w-[52ch] text-[15px] leading-relaxed text-body">
                      {/* Size on prose-p, not the wrapper: RichTextComp emits prose classes that
                          set the paragraph's font-size, so a size on the parent is overridden. */}
                      <RichTextComp
                        content={item.description as RichText}
                        className="prose-p:mb-0 prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-body"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Position indicator. Decorative — every slide stays in the accessibility tree,
                so this repeats nothing a screen reader needs. */}
            <div aria-hidden className="ps-dots mt-10 flex justify-end gap-2">
              {steps.map((_, index) => (
                <span key={index} className={`ps-dot${index === 0 ? ' is-on' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProcessStory>
  )
}
