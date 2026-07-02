import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
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
  return <Icon size={22} strokeWidth={1.75} aria-hidden className="shrink-0 text-cream/80" />
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
      className="w-full rounded-md border border-line bg-card px-9 py-12"
    >
      <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-6">
        <div className="lg:w-[27%] lg:shrink-0">
          {props?.heading && (
            <h2 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.02em] text-cream">
              {props.heading}
            </h2>
          )}
          {props?.description && (
            <RichTextComp
              content={props.description as RichText}
              className="mt-4 max-w-md prose-p:mb-0 prose-p:text-sm prose-p:leading-relaxed prose-p:text-body"
            />
          )}
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
              className="group flex min-h-[282px] flex-col rounded-md border border-line bg-ink p-6 transition-colors duration-300 hover:border-line-strong"
            >
              <span className="mb-8 flex size-12 items-center justify-center rounded-full bg-button-dark">
                <QualityBarIcon icon={item.icon} />
              </span>

              <h3 className="font-display text-[20px] font-medium leading-[1.2] tracking-[-0.02em] text-cream">
                {item.title}
              </h3>
              {item.excerpt && <p className="mt-3 text-sm leading-snug text-body">{item.excerpt}</p>}
            </Motion>
          ))}
        </div>
      </div>
    </Motion>
  )
}
