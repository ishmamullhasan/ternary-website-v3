import Motion from '@/components/animation/motion'
import IndustryBlueprint from '@/components/industry/IndustryBlueprint'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import SectionCta from '@/components/sections/SectionCta'
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

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

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

// Home tile — the scale / engagement card treatment: the gradient panel IS the fallback (always
// rendered), the industry's thumbnail layers on top, and the title + excerpt sit over a scrim.
function IndustryCard({ item }: { item: Industry }): JSX.Element {
  return (
    <Link href={item.slug ? `/industries/${item.slug}` : '#'} className={`group block h-full rounded-md ${focusRing}`}>
      <div className="relative h-full min-h-[397px] overflow-hidden rounded-md border border-transparent bg-[#0F0E0E] transition-colors duration-300 group-hover:border-line">
        {/* Isometric monoline blueprint — one motif per sector, filling the upper card, behind the text. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[66%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.03] motion-reduce:transform-none">
          <IndustryBlueprint title={item.title} />
        </div>

        <div className="absolute inset-x-5 bottom-5 z-10">
          <h3 className="font-display font-medium tracking-[-0.01em] text-cream">{item.title}</h3>
          {/* sm+ guard: reserve + clamp 2 lines so the 4-up rows share one text-block height —
              excerpts are budgeted to the 67–82ch band (2 lines at grid widths). Unprefixed
              below sm, where the single column makes row alignment moot. */}
          {item.excerpts && <p className="mt-2 text-sm text-body sm:line-clamp-2 sm:min-h-[2.86em]">{item.excerpts}</p>}
        </div>
      </div>
    </Link>
  )
}

// Two renderings share this block, both driven by the picked `industries`:
//   • Home (default, !fullWidth) — portrait cards carrying the industry's thumbnail, title and
//     excerpt, in the scale/engagement card treatment, linking to the industry page.
//   • fullWidth — the industry-detail benefit grid: icon chip + title + paragraph cards
//     (Figma 1283-2668).
export function IndustriesSectionComponent({
  heading,
  description,
  industries,
  fullWidth,
}: IndustriesSectionBlock): JSX.Element | null {
  const items = (industries ?? []).filter((i): i is Industry => typeof i === 'object' && i !== null)

  if (items.length === 0) return null

  return (
    // Default: the cards sit inside a raised `section-card` panel (home/capabilities treatment).
    // Full-width mode drops that panel — otherwise the section surface and the cards are the same
    // `#1b1a17` token, so the cards vanish. With no panel, the `bg-card` cards read against the
    // darker page, matching the industry-detail benefit grid (Figma 1283-2668).
    <Motion tag="section" className={fullWidth ? 'w-full' : 'section-card w-full'}>
      {/* The hub link belongs to the home rendering only — in `fullWidth` this block is the
          industry-detail benefit grid, already on a page under /industries, so a link back to the
          hub would be pointing at where the reader just came from. */}
      {(heading || description || !fullWidth) && (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 lg:mb-14"
        >
          <div className="max-w-2xl space-y-3">
            {heading && <h2 className="font-display text-3xl font-medium leading-[1.15] text-cream">{heading}</h2>}
            {description && (
              <RichTextComp
                content={description as RichText}
                className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
              />
            )}
          </div>
          {!fullWidth && <SectionCta href="/industries" destination="about the industries we serve" />}
        </Motion>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Home: eight cards fill a flush 4-column grid (two clean rows of four) — no leading gutter
            or trailing empty cell. Full-width detail grid also uses four columns. */}
        {!fullWidth &&
          items.map((item, index) => (
            <Motion
              key={item.id ?? index}
              tag="div"
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
            >
              <IndustryCard item={item} />
            </Motion>
          ))}

        {/* fullWidth — industry-detail benefit grid (icon chip + title + paragraph). */}
        {fullWidth &&
          items.map((item, index) => {
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

                <h3 className="font-display mt-3 text-[19px] font-medium leading-[1.18] tracking-tight text-cream lg:text-xl">
                  {item.title}
                </h3>

                {item.excerpts && <p className="mt-2 text-sm leading-relaxed text-cream/80">{item.excerpts}</p>}
              </Motion>
            )
          })}
      </div>
    </Motion>
  )
}
