import ProcessFigure from '@/components/process/ProcessFigure'
import ProcessJourney from '@/components/process/ProcessJourney'
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
 * "How we operate" — a scroll-linked journey down one structure, replacing a 2-up grid
 * of five equal bullets.
 *
 * The old layout gave every principle the same weight, showed nothing connecting them,
 * and left roughly half the panel empty. The empty half had a cause worth naming: the
 * component renders each step's `description`, and all five are empty in the CMS, so it
 * was reserving space for copy that does not exist. The layout below is built to read
 * correctly either way — titles alone now, richer the moment descriptions are authored.
 *
 * Left holds the frame — eyebrow, heading, blurb, figure — top-aligned with the first
 * item. Right is the sequence, with a rail whose fill grows as you descend and one
 * principle live at a time. Motion is limited to progressive disclosure, a growing
 * progress indicator and crossfade — ProcessJourney owns the state, processJourney.css
 * owns the timing.
 */
export default function ProcessComp({ heading, description, process }: ProcessCompProps) {
  // Empty-state guard: with no steps there is nothing to render, so collapse the section
  // entirely and let the parent RenderBlocks rhythm own the surrounding spacing.
  if (!process || process.length === 0) return null

  return (
    <ProcessJourney count={process.length}>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:gap-16">
        {/* Top-aligned, NOT pinned. It was sticky, which reads fine while the section fills the
            viewport but detaches the moment it does not: the column parks 112px down the
            viewport while the list scrolls up past it, so the heading ends up level with the
            middle of the list instead of with item 01. The section is only ~600px tall, so
            pinning bought little and cost the alignment. */}
        <div className="flex flex-col gap-5 lg:self-start">
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

          {/* One plate per principle. Courses already read stay solid, the live one is
              bright, the rest are faint — the connection the old list never showed. */}
          <div className="mt-2 hidden w-full max-w-[300px] lg:block">
            <ProcessFigure count={process.length} />
          </div>
        </div>

        {/* The sequence. `ol` because these are numbered and ordered. */}
        <ol className="relative flex flex-col gap-10 lg:gap-14">
          <span aria-hidden className="pj-rail">
            <span className="pj-rail-fill" />
          </span>

          {process.map((item, index): JSX.Element => (
            <li key={index} className="pj-step">
              <span aria-hidden className="pj-dot" />
              <span className="pj-num block text-[13px] text-cream">
                {item.number ?? String(index + 1).padStart(2, '0')}
              </span>
              {item.title && (
                <h3 className="pj-title font-display mt-2 text-[clamp(1.125rem,1.7vw,1.5rem)] leading-snug font-medium tracking-[-0.015em] text-cream">
                  {item.title}
                </h3>
              )}
              {/* Renders only when authored — no reserved gap for copy that is not there,
                  which is what left the old panel half empty. */}
              {item.description && (
                <div className="pj-body mt-2 max-w-[52ch] text-[14.5px] leading-relaxed text-body">
                  <RichTextComp content={item.description as RichText} className="prose-sm prose-p:mb-0" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </ProcessJourney>
  )
}
