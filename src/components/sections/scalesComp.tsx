'use client'
import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import type { Media, Scale } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

interface SalesCompProps {
  heading?: string | null
  description?: string | null
  scales?: Scale[] | null
}

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export default function SalesComp({ heading, description, scales }: SalesCompProps) {
  return (
    <section className="bg-main lg:p-10 lg:m-0 m-4 p-4 rounded-lg">
      <div className="flex lg:flex-row flex-col lg:justify-between lg:items-start items-center">
        {/* top header */}
        <div className="lg:w-2/5">
          <h2 className="lg:text-3xl text-2xl font-semibold mb-3">{heading}</h2>
          <p className="lg:text-base text-sm text-[#D5D5D5]">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4 gap-3 lg:pt-0 pt-4">
          {scales?.map((item, index): JSX.Element => {
            return (
              <Link href={`/scales`} key={index}>
                {/* gradient card */}
                <Motion
                  className="relative lg:w-[220px] lg:h-[250px]  rounded-lg overflow-hidden"
                  {...motionGridItemProps}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: index * 0.05,
                  }}
                >
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
                    <div className="absolute inset-0 bg-linear-to-br from-pink-500 via-purple-500 to-blue-500" />
                  )}

                  {/* text */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="lg:text-base text-sm font-semibold">{item.title}</h3>
                    <p className="lg:text-sm text-xs"> {item.excerpts}</p>
                  </div>
                </Motion>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
