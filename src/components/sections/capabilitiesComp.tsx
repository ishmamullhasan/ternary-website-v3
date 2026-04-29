'use client'
import type { Capability, Media } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

interface CapabilitiesCompProps {
  heading?: string | null
  description?: string | null
  capability?: Capability[] | null
  heading_2?: string | null
  description_2?: string | null
  image?: Media | null
}

export default function CapabilitiesComp({
  heading,
  description,
  capability,
  heading_2,
  description_2,
  image,
}: CapabilitiesCompProps) {
  return (
    <section className="bg-[#1B1A17] lg:p-10 lg:m-0 m-4 p-4">
    
        {/* top header */}
        <div className="lg:mb-15 mb-4 lg:w-2/5">
          <h2 className="lg:text-3xl text-2xl font-light mb-3">{heading}</h2>
          <p className="lg:text-base text-sm lg:not-first:max-w-[500px]">{description}</p>
        </div>

        {/* capabilities grid */}
        <div className="flex flex-row">
          <div className="lg:w-1/5"> </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-10 gap-4 lg:pt-10 pt-4 w-full lg:w-4/5 lg:pl-8">
            {capability?.map((item, index): JSX.Element => {
              return (
                <div key={index} className=" lg:p-0  lg:bg-transparent bg-[#0F0E0E] p-4">
                  <h3 className="lg:text-base text-sm font-semibold mb-2">{item.title}</h3>
                  <p className="lg:text-sm text-xs lg:mb-4 mb-3">{item.excerpts}</p>
                  <Link href={`/solutions/${item.slug}`} key={index}>
                    <button className="lg:text-sm text-xs ">
                      <u>Explore</u>
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* leadership section */}
        <div className="flex  lg:flex-row flex-col lg:mt-20 mt-8 lg:items-start items-center lg:justify-between">
          <div className="lg:w-1/5">
            <h3 className="lg:text-2xl text-xl font-light mb-3">{heading_2}</h3>
            <p className="lg:text-base text-sm">{description_2}</p>
          </div>

          <div className="lg:not-first:w-4/5 lg:h-[600px] h-[300px] overflow-hidden lg:pl-8 pl-0 lg:pt-0 pt-4">
            {image && (
              <Image
                src={image.url || ''}
                alt={image.alt || 'leadership'}
                width={image.width || 1100}
                height={image.height || 300}
                className="object-cover rounded-lg w-full h-full"
              />
            )}
          </div>
        </div>
     
    </section>
  )
}
