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
  <section className="bg-[#1B1A17] w-[1480px] p-10 mx-auto">
      <div className=" ">
        {/* top header */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-light mb-4">{heading}</h2>
          <p className="text-white/60 max-w-[500px]">{description}</p>
        </div>

        {/* capabilities grid */}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-10 gap-y-10 pt-10 w-[1200px]">
          {capability?.map((item, index): JSX.Element => {
            return (
              <div key={index}>
                <h3 className="text-[15px] mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                  {item.excerpts}
                </p>
                <Link href={`/solutions/${item.slug}`} key={index}>
                  <button className="bg-primary text-primary-foreground shadow hover:bg-primary/90">
                   Explore
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
       
        {/* leadership section */}
        <div className="flex flex-row  gap-10 mt-24 items-start">
          
          <div>
            <h3 className="text-xl mb-3">{heading_2}</h3>
            <p className="text-white/60 text-sm max-w-[260px]">
              {description_2}
            </p>
          </div>

          <div className="w-full h-[600px] rounded-xl overflow-hidden bg-neutral-200">
            {image && (
              <Image
                src={image.url || ''}
                alt={image.alt || 'leadership'}
                width={1200}
                height={600}
                className="object-cover w-full h-full"
              />
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
