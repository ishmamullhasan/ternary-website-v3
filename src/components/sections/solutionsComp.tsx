'use client'

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

export default function SolutionsComp({ heading, description, image, items }: SolutionsCompProps) {
  return (
    <div className="flex flex-col bg-main lg:p-10 lg:m-0 m-4 p-4">
      <div className="flex justify-start">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <div className="flex flex-col lg:w-[500px]">
          <h2 className="lg:text-3xl text-2xl font-light mb-3">{heading}</h2>
          {description && <p className="lg:text-base text-sm">{description}</p>}
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
              <div key={index}>
                <hr className="border-[#F4F3EC] lg:my-4 my-2" />
                <p className="text-base font-semibold">{item.title}</p>
                <p className="text-sm ">{item.excerpts}</p>
                <Link href={`/solutions/${item.slug}`} key={index}>
                  <button className="lg:text-sm text-xs shadow">
                    <u>Learn More</u>
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
