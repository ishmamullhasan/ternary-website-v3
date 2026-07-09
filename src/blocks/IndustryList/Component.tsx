import Motion from '@/components/animation/motion'
import MobileCarousel from '@/components/layout/MobileCarousel'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Industry, IndustryListBlock } from '@/payload-types'
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

// Deterministic per-industry glyph so each benefit block reads as its own topic rather than the
// repeated placeholder bolt. Matched on keywords in the title; falls back to a neutral workflow
// glyph and finally cycles a small set so adjacent tiles never share the same icon.
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

// Single industry benefit card — shared by the sm+ grid and the mobile carousel. The glyph is
// resolved by the caller and passed in so this stays a static component (no per-render component).
function IndustryCard({ item, icon: Icon }: { item: Industry; icon: LucideIcon }): JSX.Element {
  return (
    <div className="flex h-full min-h-[254px] flex-col justify-end gap-4 rounded-md bg-main p-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-page text-cream">
        <Icon size={20} strokeWidth={1.75} aria-hidden />
      </span>

      <div>
        <h3 className="font-display text-2xl font-medium leading-[1.15] text-cream opacity-90">{item.title}</h3>
        {item.excerpts && <p className="mt-2 text-base leading-[1.15] text-body opacity-75">{item.excerpts}</p>}
      </div>
    </div>
  )
}

export function IndustryListComponent(props: IndustryListBlock): JSX.Element | null {
  const industries = (props?.industry ?? []).filter((i): i is Industry => typeof i === 'object' && i !== null)

  if (industries.length === 0) return null

  return (
    <section className="w-full py-4 lg:py-8">
      {(props.heading || props.description) && (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 max-w-3xl space-y-3 lg:mb-12"
        >
          {props.heading && (
            <h2 className="font-display text-3xl font-medium leading-[1.15] text-cream">{props.heading}</h2>
          )}
          {props.description && (
            <RichTextComp
              content={props.description as RichText}
              className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
            />
          )}
        </Motion>
      )}

      {/* Mobile: horizontal snap carousel with pagination dots. */}
      <MobileCarousel slideClassName="w-[280px]">
        {industries.map((item, index) => (
          <IndustryCard key={item.id ?? index} item={item} icon={iconFor(item.title, index)} />
        ))}
      </MobileCarousel>

      {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((item, index) => (
          <Motion
            key={item.id ?? index}
            tag="div"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
          >
            <IndustryCard item={item} icon={iconFor(item.title, index)} />
          </Motion>
        ))}
      </div>
    </section>
  )
}
