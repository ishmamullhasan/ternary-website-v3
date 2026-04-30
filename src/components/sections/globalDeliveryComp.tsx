'use client'

import type { Media } from '@/payload-types'
import Image from 'next/image'

interface GlobalDeliveryCompProps {
  heading?: string | null
  description?: string | null
  image?: Media | null
  title?: string | null
  excerpt?: string | null
}

export default function GlobalDeliveryComp({
  heading,
  description,
  image: _image,
  title,
  excerpt,
}: GlobalDeliveryCompProps) {
  return (
    <div className="flex flex-col bg-main lg:p-10 lg:m-0 m-4 p-4">
      <div className="flex justify-start">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <div className="flex flex-col lg:w-2/5">
          <h2 className="lg:text-3xl text-2xl font-light mb-3">{heading}</h2>
          {description && <p className="lg:text-base text-sm">{description}</p>}
        </div>
      </div>
      <div className="flex justify-start lg:mt-8 mt-4">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <div className="flex flex-col lg:w-1/4">
          <h2 className="lg:text-2xl text-xl font-light mb-3">{title}</h2>
          {excerpt && <p className="lg:text-sm text-xs">{excerpt}</p>}
        </div>
      </div>
      <div className="lg:w-[1100px] lg:h-full lg:my-10 lg:mx-auto w-full h-[300px] my-4 mx-auto">
        <Image
          src={'/globalDelivery.svg'}
          alt={'globalDelivery'}
          width={1100}
          height={600}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  )
}
