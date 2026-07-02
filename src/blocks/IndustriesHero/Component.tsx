import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { IndustriesHeroBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function IndustriesHeroComponent(props: IndustriesHeroBlock): JSX.Element {
  return (
    <section className="w-full pt-8 pb-4 lg:pt-16 lg:pb-8">
      <div className="mx-auto flex w-full flex-col items-center justify-center text-center">
        <Motion
          tag="h1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display max-w-3xl text-3xl font-medium leading-[1.15] text-cream"
        >
          {props?.heading}
        </Motion>
        {props?.description && (
          <Motion
            tag="div"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="mt-6 max-w-3xl"
          >
            <RichTextComp
              content={props.description as RichText}
              className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
            />
          </Motion>
        )}
      </div>
    </section>
  )
}
