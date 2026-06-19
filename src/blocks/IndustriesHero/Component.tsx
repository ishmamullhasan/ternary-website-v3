import Motion from '@/components/animation/motion'
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
          className="font-display max-w-2xl text-[clamp(2rem,4vw,2.5rem)] font-medium leading-[1.12] tracking-tight text-cream"
        >
          {props?.heading}
        </Motion>
        <Motion
          tag="p"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-body lg:text-base"
        >
          {props?.description}
        </Motion>
      </div>
    </section>
  )
}
