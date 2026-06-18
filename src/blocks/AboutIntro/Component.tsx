import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutIntroBlock } from '@/payload-types'
import type { JSX } from 'react'

export function AboutIntroComponent({ heading, description, content }: AboutIntroBlock): JSX.Element {
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
    <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-4 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
      <div className="flex lg:flex-row flex-col  lg:items-start items-center lg:justify-between">
        <Motion className="lg:w-1/5" {...motionBlockProps}>
          <h3 className="lg:text-2xl text-xl mb-3 font-medium">{heading}</h3>
          <p className="lg:text-sm text-xs text-[#D5D5D5]">{description}</p>
        </Motion>

        <Motion className="lg:pl-8 pl-0 lg:pt-0 pt-4 lg:w-4/5" {...motionBlockProps}>
          <RichTextComp content={content as RichText} />
        </Motion>
      </div>
    </Motion>
  )
}
