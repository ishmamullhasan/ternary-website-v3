import Motion from '@/components/animation/motion'
import type { AboutFundingStoryBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export function AboutFundingStoryComponent({ heading, description, backgroundImage }: AboutFundingStoryBlock): JSX.Element {
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
    <Motion
      tag="section"
      className="lg:m-0 m-4 lg:py-16 py-8 bg-cover bg-center flex items-center justify-center rounded-lg overflow-hidden h-[400px]"
      style={{
        backgroundImage: `url(${
          (backgroundImage as Media)?.url ||
          'https://hips.hearstapps.com/hmg-prod/images/summer-flowers-1648478322.jpg'
        })`,
      }}
      {...motionSectionProps}
    >
      <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
        <Motion className="flex flex-col items-center lg:w-4/5" {...motionBlockProps}>
          <h1 className="text-center lg:text-3xl text-2xl font-medium mb-3">{heading}</h1>
          <p className="text-center lg:text-base text-sm text-[#D5D5D5]">{description}</p>
        </Motion>
      </div>
    </Motion>
  )
}
