import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { IndustriesDetailsBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function IndustriesDetailsComponent(props: IndustriesDetailsBlock): JSX.Element | null {
  if (!props?.heading) return null

  return (
    <section className="w-full py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="lg:w-[238px] lg:shrink-0"
        >
          <h2 className="font-display text-2xl font-medium leading-[1.15] text-cream">{props.heading}</h2>
          {props.description && <p className="mt-4 text-sm leading-[1.15] text-body">{props.description}</p>}
        </Motion>

        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
          className="flex-1 text-base leading-[1.15] text-body [&_p]:mb-3 [&_p:last-child]:mb-0"
        >
          <RichTextComp content={props.content as RichText} />
        </Motion>
      </div>
    </section>
  )
}
