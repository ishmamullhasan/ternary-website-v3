'use client'
import type { Media, Story } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

interface AboutProps {
  heading?: string | null
  description?: string | null
  stories?: Story[] | null
  organizations?: {
    heading?: string | null
    organization?:
      | {
          icon?: Media | null
          name?: string | null
          link?: string | null
        }[]
      | null
  } | null
  bottomDescription?: string | null
}

export default function AboutComp({
  heading,
  description,
  stories,
  organizations,
  bottomDescription,
}: AboutProps) {
  return (
    <div className="flex flex-col justify-center items-center relative lg:max-w-7xl w-full mx-auto my-10 lg:pt-10 md:pt-10 pt-10 lg:p-10 md:p-8 p-4">
      <h1 className="px-6 md:px-10 scroll-m-20 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight max-w-[90%] md:max-w-[800px]">
        {heading}
      </h1>

      <p className="text-[16px] lg:w-[1055px] text-center">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {(stories as Story[])?.map((item, index: number): JSX.Element => {
          return (
            <Link href={`/stories/${(item as Story)?.slug}`} key={index} className="lg:w-[365px]">
              <div className="h-[375px] lg:w-[365px]">
                <Image
                  className="rounded-2xl h-full w-full object-cover"
                  src={
                    ((item as Story)?.thumbnail as Media)?.url ||
                    'https://dummyimage.com/365x375/37624F/FFF2'
                  }
                  alt={((item as Story)?.thumbnail as Media)?.alt || 'Story'}
                  width={((item as Story)?.thumbnail as Media)?.width || 365}
                  height={((item as Story)?.thumbnail as Media)?.height || 375}
                />
                <div className="pt-2 lg:w-[365px] pb-5">
                  <p className="lg:text-[24px] text-[20px]  font-bold">{(item as Story)?.title}</p>
                  <p className="lg:text-[22px] text-[16px] ">
                    {(item as Story)?.excerpts as string}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <h1 className="px-6 md:px-10 scroll-m-20 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight max-w-[90%] md:max-w-[800px]">
        {organizations?.heading}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {(
          organizations?.organization as {
            icon?: Media | null
            name?: string | null
            link?: string | null
          }[]
        )?.map((item, index: number): JSX.Element => {
          return (
            <Link href={item.link || '#'} key={index}>
              <Image
                src={item.icon?.url || 'https://dummyimage.com/365x375/37624F/FFF2'}
                alt={item.name || 'Organization'}
                width={365}
                height={375}
              />
            </Link>
          )
        })}
      </div>
      <p className="text-[16px] lg:w-[1055px] text-center">{bottomDescription}</p>
    </div>
  )
}

{
  /* <section className="-my-10 lg:-my-0 flex flex-col gap-4 md:gap-10 w-full">
<h1 className="px-6 md:px-10 scroll-m-20 text-3xl md:text-4xl lg:text-5xl font-light tracking-tight max-w-[90%] md:max-w-[800px]">
  {heading}
</h1>

<Image
  src={imageUrl}
  alt="Hero Image"
  className="object-cover border-t border-b border-white/20"
  width={2560}
  height={1000}
/>
</section> */
}
