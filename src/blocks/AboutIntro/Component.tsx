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
 * The wide column is intentionally typeset large (30px / 1.6, per the comp) so the "We are standing at the
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
      className="rounded-md bg-main px-9 py-12"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex flex-col gap-2 lg:w-[238px] lg:shrink-0">
          {heading ? (
            <h2 className="font-display text-[22px] font-medium leading-[1.15] tracking-[-0.05em] text-cream lg:text-2xl">
              {heading}
            </h2>
          ) : null}
          {description ? (
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-sm prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-body"
            />
          ) : null}
        </div>

        <div className="lg:flex-1">
          <RichTextComp
            content={content as RichText}
            className="prose-p:mb-12 prose-p:text-[18px] prose-p:leading-[1.6] prose-p:text-body prose-p:tracking-[-0.01em] last:prose-p:mb-0 lg:prose-p:text-[30px] lg:prose-p:leading-[1.6]"
          />
        </div>
      </div>
    </Motion>
  )
}
