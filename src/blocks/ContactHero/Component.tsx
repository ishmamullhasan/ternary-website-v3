import Motion from '@/components/animation/motion'
import { careersBg, careersBorder, careersText } from '@/lib/careers-colors'
import type { ContactHeroBlock } from '@/payload-types'
import Link from 'next/link'
import type { JSX } from 'react'

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

export function ContactHeroComponent(props: ContactHeroBlock): JSX.Element {
  const heading = props?.heading
  const description = props?.description
  const button_1 = props?.buttons?.[0]
  const button_2 = props?.buttons?.[1]

  return (
    <Motion tag="section" className="space-y-6" {...motionSectionProps}>
      <Motion className="space-y-5 max-w-2xl" {...motionBlockProps}>
        <h1
          className={`text-3xl md:text-4xl lg:text-[40px] font-semibold ${careersText.white} tracking-tight leading-[1.1]`}
        >
          {heading}
        </h1>
        <p className={`text-base ${careersText.muted}`}>{description}</p>
        <div className="flex flex-wrap items-center gap-3">
          {button_1?.label && (
            <Link
              href={button_1.url || '#routes'}
              className={`${careersBg.button} ${careersBg.buttonHover} ${careersText.onLight} text-sm font-medium px-5 py-3 rounded-lg transition-colors`}
            >
              {button_1.label}
            </Link>
          )}
          {button_2?.label && (
            <Link
              href={button_2.url || '#offices'}
              className={`${careersBg.card} border ${careersBorder.input} ${careersText.body} text-sm font-medium px-5 py-3 rounded-lg hover:border-[#52525b] transition-colors`}
            >
              {button_2.label}
            </Link>
          )}
        </div>
      </Motion>
    </Motion>
  )
}
