import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { IndustriesDetailsBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function IndustriesDetailsComponent(props: IndustriesDetailsBlock): JSX.Element | null {
  if (!props?.heading) return null

  return (
    // Raised `section-card` surface (Figma `--surface/card` #1b1a17, 8px radius, 36×48 desktop
    // gutters) — matches the industry-detail "details" section (Figma 1279-4961). Heading +
    // description sit in a fixed 238px rail; the rich-text body fills the rest, 48px apart.
    <section className="section-card w-full">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col gap-2 lg:w-[238px] lg:shrink-0"
        >
          <h2 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">
            {props.heading}
          </h2>
          {props.description && (
            <RichTextComp
              content={props.description as RichText}
              className="prose-p:mb-0 prose-p:text-sm prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-body"
            />
          )}
        </Motion>

        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
          className="flex-1 text-base leading-[1.15] tracking-[-0.05em] text-body [&_p]:mb-3 [&_p:last-child]:mb-0"
        >
          <RichTextComp content={props.content as RichText} />
        </Motion>
      </div>
    </section>
  )
}
