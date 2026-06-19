import Motion from '@/components/animation/motion'
import type { QualityBarBlock } from '@/payload-types'
import { Activity, BookCheck, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const QUALITY_BAR_ICONS = {
  activity: Activity,
  'shield-check': ShieldCheck,
  workflow: Workflow,
  'book-check': BookCheck,
} as const satisfies Record<string, LucideIcon>

type QualityBarIconKey = keyof typeof QUALITY_BAR_ICONS

function QualityBarIcon({ icon }: { icon: string | null | undefined }) {
  const Icon = icon && icon in QUALITY_BAR_ICONS ? QUALITY_BAR_ICONS[icon as QualityBarIconKey] : Activity
  return <Icon size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-cream/80" />
}

export function QualityBarComponent(props: QualityBarBlock): JSX.Element | null {
  const items = props?.items ?? []
  if (!props?.heading && items.length === 0) return null

  return (
    <Motion
      tag="section"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className="w-full rounded-md bg-ink p-6 lg:p-10"
    >
      <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="lg:w-1/4 lg:shrink-0">
          {props?.heading && (
            <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-cream lg:text-3xl">
              {props.heading}
            </h2>
          )}
          {props?.description && <p className="mt-3 max-w-md text-sm leading-relaxed text-body">{props.description}</p>}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Motion
              key={item.id ?? `quality-${index}`}
              tag="div"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              className="group flex min-h-[260px] flex-col rounded-md bg-main p-8 ring-1 ring-white/5 transition-colors duration-300 hover:ring-white/10"
            >
              <span className="mb-6 flex size-12 items-center justify-center rounded-full border border-white/10 bg-ink transition-colors duration-300 group-hover:border-white/20">
                <QualityBarIcon icon={item.icon} />
              </span>

              <h3 className="font-display text-base font-medium leading-tight tracking-tight text-cream lg:text-lg">
                {item.title}
              </h3>
              {item.excerpt && <p className="mt-2 text-sm leading-relaxed text-body">{item.excerpt}</p>}
            </Motion>
          ))}
        </div>
      </div>
    </Motion>
  )
}
