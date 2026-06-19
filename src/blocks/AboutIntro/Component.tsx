import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutIntroBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Manifesto block (design node 1258:11547). A narrow left rail — short Poppins headline plus a
 * muted Inter caption — sits beside a wide column of large stacked paragraphs (the body comes from
 * the CMS rich-text `content`). Sits on the warm `bg-main` panel at the standard 5px radius.
 *
 * The wide column is intentionally typeset large (≈20px / 1.6) so the "We are standing at the
 * threshold of the agentic era…" copy reads as an editorial statement, matching the comp.
 */
export function AboutIntroComponent({ heading, description, content }: AboutIntroBlock): JSX.Element | null {
  if (!heading && !content) return null

  return (
    <Motion
      tag="section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className="rounded-md bg-main p-6 lg:p-12"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="lg:w-1/5 lg:shrink-0">
          {heading ? (
            <h2 className="font-display text-[22px] font-medium leading-[1.15] tracking-[-0.01em] text-cream lg:text-2xl">
              {heading}
            </h2>
          ) : null}
          {description ? <p className="mt-4 text-[13px] leading-relaxed text-subtle">{description}</p> : null}
        </div>

        <div className="lg:w-4/5">
          <RichTextComp
            content={content as RichText}
            className="prose-p:text-[17px] prose-p:leading-[1.6] prose-p:text-body prose-p:tracking-[-0.01em] lg:prose-p:text-[20px] lg:prose-p:leading-[1.6]"
          />
        </div>
      </div>
    </Motion>
  )
}
