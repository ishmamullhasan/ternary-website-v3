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
    <section className="bg-[#1B1A17] w-full p-10 mx-auto">
      <div className=" ">
        {/* top header */}
        <div className="mb-15 w-2/5">
          <h2 className="text-3xl font-light mb-3">{heading}</h2>
          <p className="text-base">{description}</p>
        </div>

        {/* induss grid */}
        <div className="flex flex-row justify-between">
          <div className="w-1/5"> </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industry?.map((item, index): JSX.Element => {
              return (
                <Link href={`/industry/${item.slug}`} key={index}>
                  {/* gradient card */}
                  <div className="relative w-[220px] h-[250px] rounded-lg overflow-hidden">
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
                      <h3 className=" text-base font-semibold">{item.title}</h3>
                      <p className="text-sm"> {item.excerpts}</p>
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
