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
    <div className="flex flex-col bg-[#1B1A17] p-10 mb-20">
      <div className="flex justify-start">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <div className="flex flex-col w-2/5">
          <h2 className="text-3xl font-light mb-3">{heading}</h2>
          {description && <p className="text-base">{description}</p>}
        </div>
      </div>
      <div className="flex justify-start mt-8">
        {/* {label && <Badge className="w-fit" variant="secondary">{label}</Badge>} */}
        <div className="flex flex-col w-1/4">
          <h2 className="text-2xl font-light mb-3">{title}</h2>
          {excerpt && <p className="text-sm">{excerpt}</p>}
        </div>
      </div>
      <div className="w-[1100px] h-full my-10 mx-auto">
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
