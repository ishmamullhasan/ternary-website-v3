'use client'
import type { Media, Scale } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

interface EngagementCompProps {
  heading?: string | null
  description?: string | null
  model?: Scale[] | null
}

export default function EngagementComp({ heading, description, model }: EngagementCompProps) {
  return (
    <section className="bg-[#1B1A17] lg:p-10 lg:m-0 m-4 p-4">
      <div className="flex lg:flex-row flex-col lg:justify-between lg:items-start items-center">
        {/* top header */}
        <div className="lg:w-2/5">
          <h2 className="lg:text-3xl text-2xl font-light mb-3">{heading}</h2>
          <p className="lg:text-base text-sm">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4 gap-3 lg:pt-0 pt-4">
          {model?.map((item, index): JSX.Element => {
            return (
              <Link href={`/model/${item.slug}`} key={index}>
                {/* gradient card */}
                <div className="relative lg:w-[220px] lg:h-[250px]  rounded-lg overflow-hidden">
                  {/* background image OR gradient */}
                  {item.thumbnail ? (
                    <Image
                      src={(item.thumbnail as Media)?.url || 'https://dummyimage.com/280x300/37624F/FFF2'}
                      alt={item.title || 'industry'}
                      height={(item.thumbnail as Media)?.height || 250}
                      width={(item.thumbnail as Media)?.width || 220}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
                  )}

                  {/* text */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="lg:text-base text-sm font-semibold">{item.title}</h3>
                    <p className="lg:text-sm text-xs"> {item.excerpts}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
