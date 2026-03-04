'use client'

import type { RichText } from '@/components/richtext'
import RichTextComp from '@/components/richtext'
import { Media } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

// #region agent log
const DEBUG_LOG = (msg: string, data: Record<string, unknown>) => {
  fetch('http://127.0.0.1:7242/ingest/b90bc207-9987-4caa-8206-025e2946feb2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3ed136' },
    body: JSON.stringify({
      sessionId: '3ed136',
      location: 'processComp.tsx',
      message: msg,
      data,
      timestamp: Date.now(),
      hypothesisId: 'A',
    }),
  }).catch(() => {})
}
// #endregion

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
    <section className=" bg-[#1B1A17] p-10 pb-20">
      <div className="w-full flex flex-row justify-between space-x-8">
        {/* LEFT SIDE */}
        <div className=" space-y-5">
          <div className="mb-20">
            <h2 className="text-2xl font-light mb-3">{heading}</h2>
            <p className=" text-sm ">{description}</p>
          </div>
          <div className="space-y-10">
            {/* <div ></div> */}
            {process?.slice(0, 2).map((item, index): JSX.Element => {
              
              return (
                <div key={index}>
                  <p className="text-base mb-2">{`0${index + 1}`}</p>
                  <h3 className="text-base mb-3">{item.title}</h3>
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
          <div className="bg-black rounded-xl w-[280px] h-[900px] p-4">
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
        <div className=" space-y-10 pt-30">
          {process?.slice(2).map((item, index): JSX.Element => {
            const desc = item.description
            const isRichText = desc != null && typeof desc === 'object' && 'root' in desc
            return (
              <div key={index}>
                <p className="text-base mb-2">{`0${index + 3}`}</p>
                <h3 className="text-sm mb-3">{item.title}</h3>
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
