import Motion from '@/components/animation/motion'
import type { RegulatoryPostureBlock } from '@/payload-types'
import { Activity, Check, Lock, type LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const REGULATORY_POSTURE_ICONS = {
  lock: Lock,
  activity: Activity,
  check: Check,
} as const satisfies Record<string, LucideIcon>

type RegulatoryPostureIconKey = keyof typeof REGULATORY_POSTURE_ICONS

function RegulatoryPostureIcon({ icon }: { icon: string | null | undefined }) {
  const Icon =
    icon && icon in REGULATORY_POSTURE_ICONS ? REGULATORY_POSTURE_ICONS[icon as RegulatoryPostureIconKey] : Lock
  return <Icon size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-cream/80" />
}

export function RegulatoryPostureComponent(props: RegulatoryPostureBlock): JSX.Element | null {
  if (!props?.heading) return null

  const items = props.items ?? []

  return (
    <section className="w-full py-4 lg:py-8">
      <div className="flex w-full flex-col space-y-10">
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="space-y-3"
        >
          <h2 className="font-display max-w-2xl text-3xl font-medium leading-tight tracking-tight text-cream lg:text-4xl">
            {props.heading}
          </h2>
          {props.description && <p className="max-w-4xl text-sm leading-relaxed text-body">{props.description}</p>}
        </Motion>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Motion
              key={item.id ?? `regulatory-${index}`}
              tag="div"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              className="group flex min-h-[220px] flex-col rounded-md bg-main p-8 ring-1 ring-white/5 transition-colors duration-300 hover:ring-white/10 lg:p-10"
            >
              <span className="mb-6 flex size-12 items-center justify-center rounded-full border border-white/10 bg-ink transition-colors duration-300 group-hover:border-white/20">
                <RegulatoryPostureIcon icon={item.icon} />
              </span>

              <div className="space-y-2">
                <h3 className="font-display text-lg font-medium leading-tight tracking-tight text-cream">
                  {item.title}
                </h3>
                {item.excerpt && <p className="text-sm leading-relaxed text-body">{item.excerpt}</p>}
              </div>
            </Motion>
          ))}
        </div>
      </div>
    </section>
  )
}
