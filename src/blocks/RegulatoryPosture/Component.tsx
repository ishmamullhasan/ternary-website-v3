import Motion from '@/components/animation/motion'
import type { RegulatoryPostureBlock } from '@/payload-types'
import { Activity, Check, Lock, type LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

const REGULATORY_POSTURE_ICONS = {
  lock: Lock,
  activity: Activity,
  check: Check,
} as const satisfies Record<string, LucideIcon>

type RegulatoryPostureIconKey = keyof typeof REGULATORY_POSTURE_ICONS

function RegulatoryPostureIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || !(icon in REGULATORY_POSTURE_ICONS)) return null
  const Icon = REGULATORY_POSTURE_ICONS[icon as RegulatoryPostureIconKey]
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-white/80" />
}

export function RegulatoryPostureComponent(props: RegulatoryPostureBlock): JSX.Element | null {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  if (!props?.heading) return null

  return (
    <Motion tag="section" className="w-full py-16 lg:m-0 m-4" {...motionSectionProps}>
      <div className="flex flex-col space-y-10 w-full">
        <div className="space-y-3">
          <h2 className="text-3xl lg:text-4xl font-normal tracking-tight text-white max-w-2xl leading-tight">
            {props.heading}
          </h2>
          {props.description && (
            <p className="lg:text-sm text-xs text-[#D5D5D5] max-w-4xl leading-relaxed">{props.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {props.items?.map((item, index) => (
            <Motion
              key={item.id ?? `regulatory-${index}`}
              className="bg-main p-8 lg:p-10 rounded-lg flex flex-col justify-start min-h-[220px]"
              {...motionGridItemProps}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: index * 0.05,
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#0F0E0E] flex items-center justify-center mb-6 border border-white/[0.05]">
                <RegulatoryPostureIcon icon={item.icon} />
              </div>

              <div className="space-y-2">
                <h3 className="lg:text-lg text-base font-medium tracking-wide text-white">{item.title}</h3>
                <p className="lg:text-xs text-[11px] text-[#D5D5D5] leading-relaxed line-clamp-3">{item.excerpt}</p>
              </div>
            </Motion>
          ))}
        </div>
      </div>
    </Motion>
  )
}
