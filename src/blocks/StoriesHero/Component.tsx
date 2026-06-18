import Motion from '@/components/animation/motion'
import type { StoriesHeroBlock } from '@/payload-types'
import type { JSX } from 'react'

export const StoriesHeroComponent = (data: StoriesHeroBlock): JSX.Element => {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const motionBlockProps = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.4 as const },
    transition: { duration: 0.35, ease: 'easeOut' as const },
  }

  return (
    <Motion tag="section" className="w-full lg:pt-16 lg:pb-8 pt-8 pb-4" {...motionSectionProps}>
      <div className="w-full mx-auto flex flex-col px-4 lg:px-0 items-center justify-center">
        <Motion className="flex flex-col text-center max-w-4xl" {...motionBlockProps}>
          <h1 className="lg:text-4xl text-3xl font-medium tracking-tight mb-6 max-w-3xl leading-[1.15]">
            {data.heading}
          </h1>
          <p className="lg:text-base text-sm text-[#D5D5D5] max-w-2xl">{data.description}</p>
        </Motion>
      </div>
    </Motion>
  )
}

export default StoriesHeroComponent
