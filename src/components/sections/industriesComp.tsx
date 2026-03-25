'use client'
import type { Industry, Media } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

interface IndustriesCompProps {
  heading?: string | null
  description?: string | null
  industry?: Industry[] | null
}

export default function IndustryComp({ heading, description, industry }: IndustriesCompProps) {
  return (
    <section className="bg-[#1B1A17]  lg:p-10 lg:m-0 m-4 p-4">
      <div className=" ">
        {/* top header */}
        <div className="lg:mb-15 mb-4 lg:w-2/5">
          <h2 className="lg:text-3xl text-2xl font-light mb-3">{heading}</h2>
          <p className="lg:text-base text-sm">{description}</p>
        </div>

        {/* induss grid */}
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-start items-center">
          <div className="lg:w-1/5"> </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4 gap-3">
            {industry?.map((item, index): JSX.Element => {
              return (
                <Link href={`/industry/${item.slug}`} key={index}>
                  {/* gradient card */}
                  <div className="relative lg:w-[220px] lg:h-[250px]   rounded-lg overflow-hidden">
                    {/* background image OR gradient */}
                    {item.thumbnail ? (
                      <Image
                        src={
                          (item.thumbnail as Media)?.url ||
                          'https://dummyimage.com/280x300/37624F/FFF2'
                        }
                        alt={item.title || 'industry'}
                        height={(item.thumbnail as Media)?.height || 250}
                        width={(item.thumbnail as Media)?.width || 220}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
                    )}

                    {/* text */}
                    <div className="absolute top-5 left-5 right-5">
                      <h3 className=" lg:text-base text-sm font-semibold">{item.title}</h3>
                      <p className="lg:text-sm text-xs"> {item.excerpts}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
