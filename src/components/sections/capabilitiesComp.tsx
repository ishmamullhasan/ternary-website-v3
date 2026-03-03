'use client'
import type { Media, Capability } from '@/payload-types'
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
  <section className="bg-[#1B1A17] w-full p-10 mx-auto">
      <div className=" ">
        {/* top header */}
        <div className="mb-15 w-2/5">
          <h2 className="text-3xl font-light mb-3">{heading}</h2>
          <p className="text-base max-w-[500px]">{description}</p>
        </div>

        {/* capabilities grid */}
        <div className='flex flex-row'> 
          <div className="w-1/5" >  </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-10 w-4/5 pl-8">
          {capability?.map((item, index): JSX.Element => {
            return (
              <div key={index}>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm mb-4">
                  {item.excerpts}
                </p>
                <Link href={`/solutions/${item.slug}`} key={index}>
                  <button className="text-sm ">
                   <u>Explore</u>
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
        </div>
       
        {/* leadership section */}
        <div className="flex flex-row  mt-20 items-start justify-between">
          
          <div className="w-1/5">
            <h3 className="text-2xl font-light mb-3">{heading_2}</h3>
            <p className="text-base">
              {description_2}
            </p>
          </div>

          <div className="w-4/5 h-[600px] rounded-lg overflow-hidden pl-8">
            {image && (
              <Image
                src={image.url || ''}
                alt={image.alt || 'leadership'}
                width={image.width ||  1100}
                height={image.height || 300}
                className="object-cover w-full h-full"
              />
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
