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

// Deterministic per-industry glyph so each card reads as its own topic rather than a repeated
// placeholder. Matched on keywords in the title; falls back to a neutral workflow glyph and finally
// cycles a small set so adjacent tiles never share the same icon.
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

// Renders the Industries benefit grid: a 4-up (2-row) grid of flat Surface/Card tiles. Each tile is
// a darker page-tone icon chip over a bottom-anchored text stack (title + paragraph), matching the
// Figma Benefit block (no image cover, no arrow affordance).
export function IndustriesSectionComponent({
  heading,
  description,
  industries,
}: IndustriesSectionBlock): JSX.Element | null {
  const items = (industries ?? []).filter((i): i is Industry => typeof i === 'object' && i !== null)
  if (items.length === 0) return null

  return (
    <Motion tag="section" className="w-full py-4 lg:py-8">
      {(heading || description) && (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 max-w-2xl space-y-3 lg:mb-14"
        >
          {heading && <h2 className="font-display text-3xl font-medium leading-[1.15] text-cream">{heading}</h2>}
          {description && <p className="text-base leading-[1.15] text-body">{description}</p>}
        </Motion>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = iconFor(item.title, index)
          return (
            <Motion
              key={item.id ?? index}
              tag="div"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
              className="flex min-h-[360px] flex-col justify-end gap-8 rounded-md bg-main p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-page text-cream">
                <Icon size={24} strokeWidth={1.75} aria-hidden />
              </span>

              <div>
                <h3 className="font-display text-2xl font-medium leading-[1.15] text-cream opacity-90">{item.title}</h3>
                {item.excerpts && <p className="mt-2 text-base leading-[1.15] text-body opacity-75">{item.excerpts}</p>}
              </div>
            </Motion>
          )
        })}
      </div>
    </Motion>
  )
}
