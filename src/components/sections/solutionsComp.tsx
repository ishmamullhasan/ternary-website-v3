'use client'

import Motion from '@/components/animation/motion'
import type { Media, Solution } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

interface SolutionsCompProps {
  heading?: string | null
  description?: string | null
  image?: Media | null
  items?: Solution[] | null
}

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export default function SolutionsComp({ heading, description, image, items }: SolutionsCompProps) {
  return (
    <div className="flex flex-col bg-main lg:p-10 lg:m-0 m-4 p-4 rounded-lg">
      <div className="flex justify-start">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <div className="flex flex-col lg:w-[500px]">
          {description && <p className="lg:text-base text-sm mb-3 text-[#D5D5D5]">{description}</p>}
          <h2 className="lg:text-3xl text-2xl font-semibold">{heading}</h2>
        </div>
      </div>
      <div className="w-full lg:h-[400px] h-[200px] lg:my-10 my-4">
        <Image
          src={(image as Media)?.url || 'https://dummyimage.com/365x375/37624F/FFF2'}
          alt={(image as Media)?.alt || 'image'}
          width={(image as Media)?.width || 1380}
          height={(image as Media)?.height || 400}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-5 gap-4">
          {(items as Solution[])?.map((item, index: number): JSX.Element => {
            return (
              <Motion
                key={index}
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                <p className="text-sm text-[#D5D5D5] mb-1">{item.excerpts}</p>
                <hr className="border-[#F4F3EC] lg:mb-4 mb-2" />
                <p className="text-base font-semibold">{item.title}</p>

                <Link href={`/solutions/${item.slug}`} key={index}>
                  <button className="lg:text-base text-sm shadow">
                    {/* <u>Learn More</u> */}
                    Learn More
                  </button>
                </Link>
              </Motion>
            )
          })}
        </div>
      </div>
    </div>
  )
}
