'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AspectRatio } from '../ui/aspect-ratio'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type SolutionItem = {
  title?: string | null
  description?: string | null
  icon?: { url?: string | null } | string | null
}

function getIconUrl(icon: SolutionItem['icon']): string | null {
  if (!icon) return null
  if (typeof icon === 'string') return icon
  const url = icon?.url
  return url ? getMediaUrl(url) : null
}

export default function Solutions({ items = [] }: { items?: SolutionItem[] | null }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const solutions = items?.filter((item) => item?.title) ?? []

  useEffect(() => {
    if (solutions.length === 0) return
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % solutions.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [solutions.length])

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-8 -mb-20 lg:-mb-0">
      <div className="flex flex-col h-fit border border-muted rounded-xl overflow-hidden md:col-span-1">
        {solutions.map((solution, index) => {
          const isOpen = index === activeIndex
          const iconUrl = getIconUrl(solution.icon)

          return (
            <div key={index} className="border-t border-b border-muted">
              <div
                className="p-4 flex items-center cursor-pointer"
                onClick={() => setActiveIndex(index)}
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    alt={`${solution.title} Icon`}
                    width={40}
                    height={40}
                    className="mr-3"
                  />
                )}
                <h3 className="text-base md:text-lg font-semibold">{solution.title}</h3>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 overflow-hidden">
                  <p className="text-sm md:text-base opacity-60">{solution.description}</p>
                </div>
              )}

              {isOpen && <div className="h-px w-full bg-white" />}
            </div>
          )
        })}
      </div>
      <div className="flex md:col-span-4">
        <AspectRatio ratio={2 / 1} className="bg-muted rounded-xl w-full" />
      </div>
    </div>
  )
}
