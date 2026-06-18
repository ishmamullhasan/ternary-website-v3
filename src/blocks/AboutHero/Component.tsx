import Motion from '@/components/animation/motion'
import type { AboutHeroBlock } from '@/payload-types'
import type { JSX } from 'react'

export function AboutHeroComponent({ heading, description }: AboutHeroBlock): JSX.Element {
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
    <Motion tag="section" className="lg:pb-16 pb-8" {...motionSectionProps}>
      <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
        <Motion className="flex flex-col items-center lg:w-3/5" {...motionBlockProps}>
          <h1 className="text-center lg:text-3xl text-2xl font-medium mb-3">{heading}</h1>
          <p className="text-center lg:text-base text-sm text-[#D5D5D5] ">{description}</p>
        </Motion>
      </div>
    </Motion>
  )
}
