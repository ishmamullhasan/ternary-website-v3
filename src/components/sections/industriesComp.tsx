'use client'
import type { Media, Capability, Industry } from '@/payload-types'
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
    <section className="bg-[#1B1A17] w-[1480px] p-10 mx-auto">
      <div className=" ">
        {/* top header */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-light mb-4">{heading}</h2>
          <p className="text-white/60 max-w-[500px]">{description}</p>
        </div>

        {/* induss grid */}   
        <div className="flex flex-row ">
          <div className="w-1/5"> </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 w-4/5">
            {industry?.map((item, index): JSX.Element => {
              return (
                <Link href={`/industry/${item.slug}`} key={index}>
                  {/* gradient card */}
                  <div className="relative w-[270px] h-[300px] rounded-2xl overflow-hidden">
                    {/* background image OR gradient */}
                    {item.thumbnail ? (
                      <Image
                        src={
                          (item.thumbnail as Media)?.url ||
                          'https://dummyimage.com/280x300/37624F/FFF2'
                        }
                        alt={item.title || 'industry'}
                        height={(item.thumbnail as Media)?.height || 300}
                        width={(item.thumbnail as Media)?.width || 270}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
                    )}

                    {/* text */}
                    <div className="absolute top-5 left-5 right-5">
                      <h3 className="text-white text-lg leading-snug mt-1 max-w-[220px]">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/70"> {item.excerpts}</p>
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
