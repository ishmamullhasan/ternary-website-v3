'use client'

import Motion from '@/components/animation/motion'
import type { RichText } from '@/components/richtext'
import RichTextComp from '@/components/richtext'
import type { JSX } from 'react'

interface ProcessCompProps {
  heading?: string | null
  description?: string | null
  process?:
    | {
        title?: string | null
        description?: RichText | null
      }[]
    | null
}

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export default function ProcessComp({ heading, description, process }: ProcessCompProps) {
  return (
    <section className="bg-main lg:p-10 lg:m-0 m-4 p-4 rounded-lg">
      {/* top header */}
      <div className="lg:mb-15 mb-4 lg:w-2/5">
        <h2 className="lg:text-2xl text-xl font-semibold mb-3">{heading}</h2>
        <p className="lg:text-base text-sm lg:not-first:max-w-[500px] text-[#D5D5D5]">{description}</p>
      </div>
      {/* process grid */}
      <div className="flex flex-row">
        <div className="lg:w-1/5"> </div>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-4 lg:pt-10 pt-4 w-full lg:w-4/5 lg:pl-8">
          {process?.map((item, index): JSX.Element => {
            return (
              <Motion
                key={index}
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                <p className="lg:text-base text-sm mb-2">{`0${index + 1}`}</p>
                <h3 className="lg:text-base text-sm mb-3">{item.title}</h3>
                <div className="">
                  <RichTextComp content={item.description as RichText} />
                </div>
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
