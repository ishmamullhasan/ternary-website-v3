'use client'

import type { RichText } from '@/components/richtext'
import RichTextComp from '@/components/richtext'
import { Media } from '@/payload-types'
import Image from 'next/image'
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
    <section className=" bg-[#1B1A17] lg:p-10 p-4 lg:m-0 m-4 lg:pb-20 pb-6">
      <div className="w-full flex lg:flex-row flex-col lg:justify-between lg:space-x-8 space-y-4">
        {/* LEFT SIDE */}
        <div className="lg:space-y-5 space-y-4">
          <div className="lg:mb-20 mb-4">
            <h2 className="lg:text-2xl text-xl font-light mb-3">{heading}</h2>
            <p className="lg:text-sm text-xs ">{description}</p>
          </div>
          <div className="lg:space-y-10 space-y-4">
            {/* <div ></div> */}
            {process?.slice(0, 2).map((item, index): JSX.Element => {
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
        {/* CENTER IMAGE */}
        <div className="">
          <div className="bg-black rounded-xl lg:w-[280px] lg:h-[900px] h-[600px] p-4">
            <Image
              src={(image as Media)?.url || '/process.svg'}
              alt={(image as Media)?.alt || 'Process Illustration'}
              width={(image as Media)?.width || 200}
              height={(image as Media)?.height || 900}
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className=" lg:space-y-10  space-y-4 lg:pt-30 pt-4">
          {process?.slice(2).map(
            (item, index): JSX.Element => (
              <div key={index}>
                <p className="lg:text-base text-sm mb-2">{`0${index + 3}`}</p>
                <h3 className="lg:text-base text-sm mb-3">{item.title}</h3>
                <div className="">
                  <RichTextComp content={item.description as RichText} />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
