'use client'
import Motion from '@/components/animation/motion'
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

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
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
    <section className="bg-main lg:p-10 lg:m-0 m-4 p-4 rounded-lg">
      {/* top header */}
      <div className="lg:mb-15 mb-4 lg:w-2/5">
        <p className="lg:text-base text-sm lg:not-first:max-w-[500px] mb-3 text-[#D5D5D5]">{description}</p>
        <h2 className="lg:text-3xl text-2xl font-semibold">{heading}</h2>
      </div>

      {/* capabilities grid */}
      <div className="flex flex-row">
        <div className="lg:w-1/5"> </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:pt-10 pt-4 w-full lg:w-4/5 lg:pl-8">
          {capability?.map((item, index): JSX.Element => {
            return (
              <Motion
                key={index}
                className="bg-[#0F0E0E] p-4"
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                <h3 className="lg:text-base text-sm font-light mb-2">{item.title}</h3>
                <p className="lg:text-sm text-xs lg:mb-4 mb-3">{item.excerpts}</p>
                <Link href={`/capabilities/${item.slug}`} key={index}>
                  <button className="lg:text-base text-xs mt-10">Explore</button>
                </Link>
              </Motion>
            )
          })}
        </div>
      </div>

      {/* leadership section */}
      <div className="flex  lg:flex-row flex-col lg:mt-20 mt-8 lg:items-start items-center lg:justify-between">
        <div className="lg:w-1/5">
          <p className="lg:text-base text-sm mb-3 text-[#D5D5D5]">{description_2}</p>
          <h3 className="lg:text-2xl text-xl font-semibold">{heading_2}</h3>
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
