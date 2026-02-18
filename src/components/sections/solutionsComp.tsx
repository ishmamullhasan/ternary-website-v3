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
    <div className="flex flex-col bg-[#1B1A17] p-10">
      <div className="flex justify-start">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <div className="flex flex-col w-[500px]">
          <h2 className="text-3xl font-light lg:text-4xl">{heading}</h2>
          {description && <p className="opacity-65">{description}</p>}
        </div>
      </div>
      <div className="w-[1480] h-[400px] my-10">
        <Image
          src={(image as Media)?.url || 'https://dummyimage.com/365x375/37624F/FFF2'}
          alt={(image as Media)?.alt || 'image'}
          width={1480}
          height={400}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {(items as Solution[])?.map((item, index: number): JSX.Element => {
            return (
              <div  key={index}>
                <hr className="border-[#F4F3EC] my-4"/>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="text-sm text-white/60 mb-2">{item.excerpts}</p>
                <Link href={`/solutions/${item.slug}`} key={index}>
                  <button className="bg-primary text-primary-foreground shadow hover:bg-primary/90">
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
