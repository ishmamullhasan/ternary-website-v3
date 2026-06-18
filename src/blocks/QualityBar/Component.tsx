import Motion from '@/components/animation/motion'
import { Activity, BookCheck, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

// TODO: switch to QualityBarBlock after generate:types
interface QualityBarBlock {
  heading?: string | null
  description?: string | null
  items?:
    | {
        title: string
        excerpt?: string | null
        icon?: ('activity' | 'shield-check' | 'workflow' | 'book-check') | null
        id?: string | null
      }[]
    | null
}

const QUALITY_BAR_ICONS = {
  activity: Activity,
  'shield-check': ShieldCheck,
  workflow: Workflow,
  'book-check': BookCheck,
} as const satisfies Record<string, LucideIcon>

type QualityBarIconKey = keyof typeof QUALITY_BAR_ICONS

function QualityBarIcon({ icon }: { icon: string | null | undefined }) {
  if (!icon || !(icon in QUALITY_BAR_ICONS)) return null
  const Icon = QUALITY_BAR_ICONS[icon as QualityBarIconKey]
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-white/80" />
}

export function QualityBarComponent(props: QualityBarBlock): JSX.Element {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  /** Careers hero image panel: scale + opacity in view */
  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <Motion tag="section" className="bg-main p-10 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
      {/* Structured Content Grid Layout (Matching image_42113f.png blueprint) */}
      <div className="flex flex-col lg:flex-row w-full">
        <div className="lg:w-2/8 pr-4  mb-6">
          <h2 className="lg:text-3xl text-2xl font-semibold mb-3 tracking-tight max-w-xl leading-tight">
            {props?.heading}
          </h2>
          <p className="lg:text-sm text-xs text-[#D5D5D5] max-w-2xl leading-relaxed">
            {props?.description}
          </p>
        </div>

        {/* 4-column card grid containing elements configured via Payload CMS schemas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:w-6/8 ">
          {props?.items?.map((item, index) => {
            return (
              <Motion
                key={item.id ?? `scale-${index}`}
                className="bg-[#0F0E0E] p-10 rounded-md flex flex-col justify-start min-h-[280px]"
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-6 border border-white/[0.05]">
                  <QualityBarIcon icon={item.icon} />
                </div>

                {/* Text Layout Metadata */}
                <h3 className="lg:text-lg text-base font-medium mb-3 tracking-wide text-white">{item.title}</h3>

                <p className="lg:text-xs text-[11px] text-[#D5D5D5]">{item.excerpt}</p>
              </Motion>
            )
          })}
        </div>
      </div>
    </Motion>
  )
}
