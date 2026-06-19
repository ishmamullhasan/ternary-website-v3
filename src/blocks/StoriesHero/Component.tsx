import Motion from '@/components/animation/motion'
import type { StoriesHeroBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const StoriesHeroComponent = (data: StoriesHeroBlock): JSX.Element => {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-12 lg:pt-20">
      <div className="max-w-3xl">
        <Motion
          tag="h1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-[clamp(1.75rem,4vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.045em] text-cream"
        >
          {data.heading}
        </Motion>
        {data.description && (
          <Motion
            tag="p"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="mt-5 max-w-2xl text-[15px] leading-[1.55] tracking-[-0.01em] text-body lg:text-base"
          >
            {data.description}
          </Motion>
        )}
      </div>
    </section>
  )
}

export default StoriesHeroComponent
