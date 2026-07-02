'use client'

import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { Button } from '@/components/ui/button'
import type { Media, Solution } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

interface SolutionsCompProps {
  heading?: string | null
  description?: RichText | string | null
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
    <section className="section-card flex w-full flex-col">
      <div className="flex justify-start">
        <div className="flex flex-col lg:w-[500px]">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && (
            <RichTextComp
              content={description as RichText}
              className="mt-3 prose-p:mb-0 prose-p:text-body lg:prose-p:text-base"
            />
          )}
        </div>
      </div>

      {/* Hero media: the gradient field IS the fallback; the CMS image layers on top when present. */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="group relative my-8 aspect-[16/7] w-full overflow-hidden rounded-md border border-white/[0.06] lg:my-10"
      >
        <GradientPanel tone={toneFor(undefined, 0)} interactive />
        {hero?.url && <Image src={hero.url} alt={hero.alt || ''} fill className="relative object-cover" />}
      </Motion>

      <div className="w-full">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
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
                {item.excerpts && <p className="text-sm leading-relaxed text-body">{item.excerpts}</p>}
                {/* Divider + title + link pinned to the bottom so titles align across columns. */}
                <hr className="mt-auto border-line" />
                <h3 className="mt-3 font-display text-base font-medium text-cream">{item.title}</h3>

                <Button asChild variant="link" size="clear" className="mt-2 text-body hover:text-cream">
                  <Link href="/solutions" className="group/link inline-flex items-center gap-1">
                    Learn More
                    <ArrowUpRight
                      size={16}
                      aria-hidden
                      className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </Link>
                </Button>
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
