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
 * CONTENT NOTE, because it matters more here than in either previous version: every
 * step's `description` is empty in the CMS. The stage is built around a principle plus
 * one supporting line, so with titles alone it runs light. It reads correctly either way,
 * but this is the design that most rewards those five sentences being written — and they
 * are not invented here.
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
      <div className="ps-pin">
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

          {/* The stage. */}
          <div>
            <div className="ps-stage">
              {/* Holds the stage open at the tallest slide's height so nothing jumps as the
                  copy changes length. Hidden from sight and from screen readers — the real
                  slides below carry the content. */}
              <div aria-hidden className="ps-sizer">
                <h3 className="font-display text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em]">
                  {longest}
                </h3>
                <p className="mt-4 text-[clamp(1rem,1.3vw,1.25rem)] leading-relaxed">&nbsp;</p>
              </div>

              {steps.map((item, index): JSX.Element => (
                <article key={index} className="ps-slide">
                  {item.title && (
                    <h3 className="font-display max-w-[20ch] text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-cream">
                      {item.title}
                    </h3>
                  )}
                  {/* Renders only when authored — the stage reserves no gap for copy that
                      does not exist. */}
                  {item.description && (
                    <div className="mt-4 max-w-[46ch] text-[clamp(1rem,1.3vw,1.25rem)] leading-relaxed text-body">
                      <RichTextComp content={item.description as RichText} className="prose-p:mb-0" />
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Position indicator. Decorative — every slide stays in the accessibility tree,
                so this repeats nothing a screen reader needs. */}
            <div aria-hidden className="ps-dots mt-10 flex gap-2">
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
