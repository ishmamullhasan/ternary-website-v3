'use client'

import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import Link from '@/components/LocalizedLink'
import { Button } from '@/components/ui/button'
import type { Media, Solution } from '@/payload-types'
import Image from 'next/image'
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

export default function SolutionsComp({ heading, description, image, items }: SolutionsCompProps): JSX.Element | null {
  const solutions = (items as Solution[] | null | undefined) ?? []
  if (solutions.length === 0) return null

  const hero = image as Media | null | undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-5">
      <div className="flex flex-col gap-8 rounded-lg bg-main px-6 py-12 lg:px-9">
        <div className="flex justify-start">
          <div className="flex flex-col gap-4 lg:w-[500px]">
            {description && <p className="text-body lg:text-base">{description}</p>}
            {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          </div>
        </div>

        {/* Hero media: the gradient field IS the fallback; the CMS image layers on top when present. */}
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="group relative aspect-[16/7] w-full overflow-hidden rounded-md"
        >
          <GradientPanel tone={toneFor(undefined, 0)} interactive />
          {hero?.url && <Image src={hero.url} alt={hero.alt || ''} fill className="relative object-cover" />}
        </Motion>

        <div className="w-full">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {solutions.map((item, index: number): JSX.Element => {
              return (
                <Motion
                  key={item.id ?? index}
                  {...motionGridItemProps}
                  className="flex h-full flex-col"
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: index * 0.05,
                  }}
                >
                  {item.excerpts && <p className="text-sm text-body">{item.excerpts}</p>}
                  <hr className="my-2 border-line" />
                  <h3 className="text-base font-medium text-cream">{item.title}</h3>

                  <Button asChild variant="link" size="clear" className="mt-4 text-cream hover:text-body">
                    <Link href="/solutions" className="inline-flex items-center text-sm font-medium">
                      Learn More
                    </Link>
                  </Button>
                </Motion>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
