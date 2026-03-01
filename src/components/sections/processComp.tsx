'use client'

import RichText from '@/components/RichText'
import { Media } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
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
        description?: richText | null
      }[]
    | null
}

export default function ProcessComp({
  heading,
  description,
  image,
  process,
}: ProcessCompProps) {
  return (
    <section className=" bg-[#1B1A17] p-10 pb-20">
      <div className="max-w-[1480px] mx-auto flex flex-row gap-16">

        {/* LEFT SIDE */}
        <div className="w-1/3 space-y-5">
          <div>
            <h2 className="text-3xl font-light mb-4">{heading}</h2>
            <p className=" text-sm ">
              {description}
            </p>
          </div>

          {process?.slice(0, 2).map((item, index): JSX.Element => {
            // #region agent log
            DEBUG_LOG('process item.description before render', {
              index,
              descType: typeof item.description,
              hasRoot: item.description != null && typeof item.description === 'object' && 'root' in item.description,
              keys: item.description != null && typeof item.description === 'object' ? Object.keys(item.description) : null,
            })
            // #endregion
            const desc = item.description
            const isRichText = desc != null && typeof desc === 'object' && 'root' in desc
            return (
              <div key={index}>
                <p className="text-base mb-2">
                  {`0${index + 1}`}
                </p>
                <h3 className="text-base mb-3">{item.title}</h3>
                <div className="">
                  {isRichText ? (
                    <RichText data={desc as DefaultTypedEditorState} enableGutter={false} enableProse={false} />
                  ) : (
                    typeof desc === 'string' ? desc : null
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CENTER IMAGE */}
        <div className="w-1/3 flex justify-center">
          <div className="bg-black rounded-xl w-[200px] h-[700px] p-12">
            <Image
              src={(image as Media)?.url || "/process.svg"}
              alt={(image as Media)?.alt || "Process Illustration"}
              width={(image as Media)?.width || 200}
              height={(image as Media)?.height || 700}
              
              className="object-cover w-full h-full"
            />
          </div>    
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/3 space-y-16">
          {process?.slice(2).map((item, index): JSX.Element => {
            const desc = item.description
            const isRichText = desc != null && typeof desc === 'object' && 'root' in desc
            return (
              <div key={index}>
                <p className="text-base mb-2">
                  {`0${index + 3}`}
                </p>
                <h3 className="text-sm mb-3">{item.title}</h3>
                <div className="">
                  {isRichText ? (
                    <RichText data={desc as DefaultTypedEditorState} enableGutter={false} enableProse={false} />
                  ) : (
                    typeof desc === 'string' ? desc : null
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}