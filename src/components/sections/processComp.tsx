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
        number?: string | null
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
    <section className="flex flex-col gap-8">
      {/* Header — left-aligned, description above the heading (Figma 1255:3360). */}
      <Motion className="flex flex-col gap-1" {...reveal}>
        {description && <p className="max-w-xl text-[14px] leading-relaxed text-body">{description}</p>}
        {heading && <h2 className="text-2xl font-display font-medium text-cream">{heading}</h2>}
      </Motion>

      {/* Steps — a 2-up card grid offset under a left gutter; the final/odd step spans full width. */}
      <div className="lg:pl-[20%]">
        <ol className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {process.map((item, index): JSX.Element => {
            const isLast = index === process.length - 1
            const spansFull = isLast && process.length % 2 === 1
            return (
              <Motion
                tag="li"
                key={index}
                className={`flex flex-col gap-6${spansFull ? ' lg:col-span-2' : ''}`}
                {...revealItem(index)}
              >
                <span className="text-[14px] tabular-nums text-cream">
                  {item.number ?? String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-4">
                  {item.title && <h3 className="text-[16px] font-medium leading-snug text-cream">{item.title}</h3>}
                  {item.description && (
                    <div className="max-w-2xl text-[14px] leading-relaxed text-cream">
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
