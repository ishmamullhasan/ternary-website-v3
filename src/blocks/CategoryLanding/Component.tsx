import Motion from '@/components/animation/motion'
import type { CategoryLandingBlock, Media } from '@/payload-types'
import { ArrowUpRight, FileText, FlaskConical, Lightbulb, Newspaper, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

const CATEGORY_LANDING_ICONS = {
  newspaper: Newspaper,
  'flask-conical': FlaskConical,
  lightbulb: Lightbulb,
  'file-text': FileText,
} as const satisfies Record<string, LucideIcon>

type CategoryLandingIconKey = keyof typeof CATEGORY_LANDING_ICONS

const CATEGORY_GRADIENTS = [
  'bg-linear-to-br from-[#1a3d6b] via-[#1e5f7a] to-[#2a9aad]',
  'bg-linear-to-br from-[#3a1f66] via-[#5a2d8a] to-[#7a3fb8]',
  'bg-linear-to-br from-[#0d3d32] via-[#1a5c48] to-[#2a9a6a]',
  'bg-linear-to-br from-[#4a1848] via-[#7a2d58] to-[#c43d68]',
] as const

function CategoryLandingIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || !(icon in CATEGORY_LANDING_ICONS)) return null
  const Icon = CATEGORY_LANDING_ICONS[icon as CategoryLandingIconKey]
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-white" />
}

export const CategoryLandingComponent = (data: CategoryLandingBlock): JSX.Element | null => {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  if (!data.categories || data.categories.length === 0) return null

  return (
    <Motion tag="section" className="w-full lg:m-0 m-4 space-y-8" {...motionSectionProps}>
      <div className="space-y-3 max-w-3xl">
        {data.heading && (
          <h2 className="lg:text-3xl text-2xl font-medium tracking-tight text-white">{data.heading}</h2>
        )}
        {data.description && (
          <p className="lg:text-sm text-xs text-[#D5D5D5] leading-relaxed">{data.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.categories.map((category, index) => {
          const image = category.image as Media | undefined
          const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]

          const content = (
            <Motion
              className="relative rounded-lg overflow-hidden h-[360px] lg:h-[440px] flex flex-col justify-end p-8 group"
              initial={{ opacity: 0, scale: 0.985 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
            >
              {image?.url ? (
                <>
                  <Image
                    src={image.url}
                    alt={image.alt || category.title || 'Category'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </>
              ) : (
                <div className={`absolute inset-0 ${gradient}`} />
              )}

              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 contrast-150 mix-blend-overlay pointer-events-none" />

              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mb-5">
                  <CategoryLandingIcon icon={category.icon} />
                </div>

                <div className="space-y-3">
                  {category.title && (
                    <h3 className="text-2xl lg:text-[28px] font-medium tracking-tight text-white leading-tight">
                      {category.title}
                    </h3>
                  )}
                  {category.description && (
                    <p className="text-sm text-white/75 leading-relaxed line-clamp-2">{category.description}</p>
                  )}
                  {category.link && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-white/90 pt-1 group-hover:text-white transition-colors">
                      {category.linkLabel || 'Open section'}
                      <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
                    </span>
                  )}
                </div>
              </div>
            </Motion>
          )

          return category.link ? (
            <Link key={category.id ?? `category-${index}`} href={category.link} className="block">
              {content}
            </Link>
          ) : (
            <div key={category.id ?? `category-${index}`}>{content}</div>
          )
        })}
      </div>
    </Motion>
  )
}

export default CategoryLandingComponent
