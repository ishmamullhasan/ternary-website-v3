'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CardDescription, CardTitle } from '../ui/card'
import { ArrowUpRight } from 'lucide-react'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type IncubationItem = {
  title?: string | null
  description?: string | null
  image?: { url?: string | null } | string | null
  link?: string | null
}

function getImageUrl(image: IncubationItem['image']): string {
  if (!image) return ''
  if (typeof image === 'string') return image
  const url = image?.url
  return url ? getMediaUrl(url) : ''
}

export default function Incubations({ items = [] }: { items?: IncubationItem[] | null }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0)
  const [isSmallDevice, setIsSmallDevice] = useState(false)
  const cardsData = items?.filter((item) => item?.title) ?? []

  useEffect(() => {
    const updateDeviceSize = () => {
      setIsSmallDevice(window.innerWidth <= 770)
    }
    updateDeviceSize()
    window.addEventListener('resize', updateDeviceSize)
    return () => window.removeEventListener('resize', updateDeviceSize)
  }, [])

  return (
    <div className="relative flex flex-wrap justify-between items-end gap-6 w-full ">
      {cardsData.map((card, index) => {
        const isActive =
          hoveredIndex === index || (hoveredIndex === null && index === 0)
        const imageUrl = getImageUrl(card.image)

        return (
          <div
            key={index}
            className="overflow-hidden relative rounded-xl border border-muted w-full transition-all duration-300 ease-out"
            style={{
              width: isActive
                ? isSmallDevice
                  ? '100%'
                  : '64%'
                : isSmallDevice
                  ? '70%'
                  : '34%',
              height: isActive
                ? isSmallDevice
                  ? '400px'
                  : '550px'
                : isSmallDevice
                  ? '250px'
                  : '500px',
              zIndex: hoveredIndex === index ? 10 : 0,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link href={card.link ?? '#'} className="absolute inset-0 z-30" />
            {imageUrl ? (
              <div
                className="absolute top-36 left-12 w-[700px] h-[400px] xl:w-[900px] h-[500px] transition-transform duration-500 hover:scale-105"
                style={{
                  backgroundImage: `url('${imageUrl}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'top',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.8))',
                  }}
                />
              </div>
            ) : (
              <div className="absolute top-36 left-12 w-[700px] h-[400px] xl:w-[900px] h-[500px] bg-muted" />
            )}

            <div className="absolute top-6 left-6 space-y-2 z-20">
              <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
              <CardDescription className="text-sm text-gray-200">
                {card.description}
              </CardDescription>
            </div>
            <div
              className="absolute top-6 right-6 z-20 border border-muted p-2 rounded-3xl transition-opacity duration-300"
              style={{ opacity: isActive ? 1 : 0 }}
            >
              <ArrowUpRight className="opacity-60 hover:opacity-100 text-white" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
