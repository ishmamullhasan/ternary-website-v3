'use client'

import type { RichText } from '@/components/richtext'
import RichTextComp from '@/components/richtext'
import { Media } from '@/payload-types'
import type { JSX } from 'react'

interface ProcessCompProps {
  heading?: string | null
  description?: string | null
  image?: Media | null
  process?:
    | {
        title?: string | null
        description?: RichText | null
      }[]
    | null
}

export default function ProcessComp({ heading, description, image, process }: ProcessCompProps) {
  return (
    <section className="bg-[#1B1A17] lg:p-10 lg:m-0 m-4 p-4">
      {/* top header */}
      <div className="lg:mb-15 mb-4 lg:w-2/5">
        <p className="lg:text-base text-sm lg:not-first:max-w-[500px] mb-3 text-[#D5D5D5]">{description}</p>
        <h2 className="lg:text-2xl text-xl font-semibold">{heading}</h2>
      </div>
      {/* process grid */}
      <div className="flex flex-row">
        <div className="lg:w-1/5"> </div>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-4 lg:pt-10 pt-4 w-full lg:w-4/5 lg:pl-8">
          {process?.map((item, index): JSX.Element => {
            return (
              <div key={index}>
                <p className="lg:text-base text-sm mb-2">{`0${index + 1}`}</p>
                <h3 className="lg:text-base text-sm mb-3">{item.title}</h3>
                <div className="">
                  <RichTextComp content={item.description as RichText} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
