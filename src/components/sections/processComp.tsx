'use client'

import Motion from '@/components/animation/motion'
import { reveal, revealItem } from '@/components/animation/reveal'
import type { RichText } from '@/components/richtext'
import RichTextComp from '@/components/richtext'
import type { JSX } from 'react'

interface ProcessCompProps {
  heading?: string | null
  description?: string | null
  process?:
    | {
        title?: string | null
        description?: RichText | null
      }[]
    | null
}

export default function ProcessComp({ heading, description, process }: ProcessCompProps) {
  // Empty-state guard: with no steps there is nothing to render, so collapse the section
  // entirely and let the parent RenderBlocks rhythm own the surrounding spacing.
  if (!process || process.length === 0) return null

  return (
    <section className="rounded-md border border-white/[0.06] bg-ink p-6 lg:p-12">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        {/* Header — pinned to the left, mirroring the capability "How we do it" rhythm. */}
        <Motion className="flex shrink-0 flex-col gap-4 lg:w-[32%]" {...reveal}>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-subtle">Process</p>
          {heading && (
            <h2 className="font-display text-section text-cream">{heading}</h2>
          )}
          {description && <p className="max-w-md text-[15px] leading-relaxed text-body">{description}</p>}
        </Motion>

        {/* Numbered steps — the capability ordered-list pattern: tabular index, hairline divider. */}
        <ol className="flex flex-1 flex-col">
          {process.map((item, index): JSX.Element => {
            return (
              <Motion
                tag="li"
                key={index}
                className="flex items-start gap-6 border-t border-white/[0.06] py-6 first:border-t-0 first:pt-0"
                {...revealItem(index)}
              >
                <span className="shrink-0 pt-1 text-[12px] font-medium tabular-nums tracking-[0.06em] text-subtle">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-2">
                  {item.title && (
                    <h3 className="text-[16px] font-medium leading-snug text-cream">{item.title}</h3>
                  )}
                  {item.description && (
                    <div className="max-w-2xl text-[14px] leading-relaxed text-body">
                      <RichTextComp content={item.description as RichText} className="prose-sm" />
                    </div>
                  )}
                </div>
              </Motion>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
