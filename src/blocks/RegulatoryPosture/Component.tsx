import Motion from '@/components/animation/motion'
import MobileCarousel from '@/components/layout/MobileCarousel'
import RichTextComp, { type RichText } from '@/components/richtext'
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

type RegulatoryPostureItem = NonNullable<RegulatoryPostureBlock['items']>[number]

// Single compliance card — shared by the sm+ grid and the mobile carousel. Bottom-anchors its copy
// under a bg-ink icon chip.
function RegulatoryCard({ item }: { item: RegulatoryPostureItem }): JSX.Element {
  return (
    <div className="flex h-full min-h-[254px] flex-col justify-end gap-4 overflow-clip rounded-md bg-card p-6">
      <span className="flex size-12 items-center justify-center rounded-full bg-ink">
        <RegulatoryPostureIcon icon={item.icon} />
      </span>

      <div className="space-y-2">
        <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream opacity-90">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="text-base leading-[1.15] tracking-[-0.05em] text-body opacity-75">{item.excerpt}</p>
        )}
      </div>
    </div>
  )
}

// Regulatory posture section (Figma 1291-3222): a transparent section (no card shell) with a
// heading block, then a row of bg-card compliance cards. Each card bottom-anchors its copy under a
// bg-ink icon chip.
export function RegulatoryPostureComponent(props: RegulatoryPostureBlock): JSX.Element | null {
  if (!props?.heading) return null

  const items = props.items ?? []

  return (
    <section className="w-full py-4 lg:py-8">
      {/* 24px (Figma `--space/24`) between the heading block and the card row. */}
      <div className="flex w-full flex-col gap-6">
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="space-y-3"
        >
          <h2 className="font-display max-w-md text-3xl font-medium leading-[1.15] tracking-[-0.05em] text-cream opacity-90">
            {props.heading}
          </h2>
          {props.description && (
            <RichTextComp
              content={props.description as RichText}
              className="max-w-3xl opacity-90 prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-body"
            />
          )}
        </Motion>

        {/* Mobile: horizontal snap carousel with pagination dots. */}
        <MobileCarousel slideClassName="w-[280px]">
          {items.map((item, index) => (
            <RegulatoryCard key={item.id ?? `regulatory-${index}`} item={item} />
          ))}
        </MobileCarousel>

        {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
        <div className="hidden w-full gap-4 sm:grid md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Motion
              key={item.id ?? `regulatory-${index}`}
              tag="div"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
            >
              <RegulatoryCard item={item} />
            </Motion>
          ))}
        </div>
      </div>
    </section>
  )
}
