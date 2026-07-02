import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { StoriesHeroBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const StoriesHeroComponent = (data: StoriesHeroBlock): JSX.Element => {
  return (
    <section className="w-full py-12 lg:py-[72px]">
      <div className="mx-auto flex max-w-[1288px] flex-col items-center gap-6 text-center">
        <Motion
          tag="h1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-[clamp(1.875rem,4vw,2.5rem)] font-medium leading-[1.15] tracking-[-0.05em] text-cream opacity-90"
        >
          {data.heading}
        </Motion>
        {data.description && (
          <Motion
            tag="div"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="max-w-2xl opacity-90"
          >
            <RichTextComp
              content={data.description as RichText}
              className="prose-p:mb-0 prose-p:text-base prose-p:font-medium prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-body"
            />
          </Motion>
        )}
      </div>
    </section>
  )
}

export default StoriesHeroComponent
