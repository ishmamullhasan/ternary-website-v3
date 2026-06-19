import Motion from '@/components/animation/motion'
import type { IndustriesSectionBlock, Industry } from '@/payload-types'
import {
  Banknote,
  Factory,
  HeartPulse,
  Landmark,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Deterministic per-industry glyph (mirrors IndustryList) so each benefit block reads as its own
// topic. Matched on title keywords; falls back to a small cycle so adjacent tiles never repeat.
const KEYWORD_ICONS: ReadonlyArray<readonly [RegExp, LucideIcon]> = [
  [/bank|capital|financ|invest/i, Banknote],
  [/insur|risk/i, ShieldCheck],
  [/manufactur|industrial|supply/i, Factory],
  [/health|life science|care|medic/i, HeartPulse],
  [/sport|entertain|media|leisure|hospitality|travel/i, Trophy],
  [/consumer|retail|goods|commerce/i, ShoppingBag],
  [/software|platform|tech|saas|cloud/i, Workflow],
  [/public|govern|sector|civic/i, Landmark],
]

const FALLBACK_CYCLE: readonly LucideIcon[] = [Workflow, Factory, ShoppingBag, Plane]

function iconFor(title: string | null | undefined, index: number): LucideIcon {
  if (title) {
    for (const [pattern, Icon] of KEYWORD_ICONS) {
      if (pattern.test(title)) return Icon
    }
  }
  return FALLBACK_CYCLE[index % FALLBACK_CYCLE.length]
}

// Renders the design's plain 8-up benefit grid directly (no off-brand gradient cards): an optional
// heading/intro followed by icon + title + excerpt blocks sitting on the flat section surface.
export function IndustriesSectionComponent({
  heading,
  description,
  industries,
}: IndustriesSectionBlock): JSX.Element | null {
  const items = (industries ?? []).filter((i): i is Industry => typeof i === 'object' && i !== null)
  if (items.length === 0) return null

  return (
    <section className="w-full py-4 lg:py-8">
      {(heading || description) && (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 max-w-2xl space-y-3 lg:mb-14"
        >
          {heading && (
            <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-cream lg:text-3xl">
              {heading}
            </h2>
          )}
          {description && <p className="text-sm leading-relaxed text-body lg:text-base">{description}</p>}
        </Motion>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = iconFor(item.title, index)
          return (
            <Motion
              key={item.id ?? index}
              tag="div"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              className="group flex flex-col"
            >
              <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-main text-cream/80 shadow-inner transition-colors duration-300 group-hover:border-white/20 group-hover:text-cream">
                <Icon size={22} strokeWidth={1.75} aria-hidden />
              </span>

              <h3 className="font-display mt-6 max-w-[14rem] text-[19px] font-medium leading-[1.18] tracking-tight text-cream lg:text-xl">
                {item.title}
              </h3>

              {item.excerpts && <p className="mt-3 max-w-[20rem] text-sm leading-relaxed text-body">{item.excerpts}</p>}
            </Motion>
          )
        })}
      </div>
    </section>
  )
}
