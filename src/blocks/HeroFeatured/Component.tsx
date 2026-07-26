import Link from '@/components/LocalizedLink'
import Motion from '@/components/animation/motion'
import type { HeroFeaturedBlock, Insight, PressRelease, Story } from '@/payload-types'
import type { JSX } from 'react'

/**
 * Homepage signature hero (WEB-458), CMS-driven. Renders a localized thesis line + display headline,
 * then a grid of "work stream" cards from the block's curated `items` (case studies, insights, press
 * releases), each keyed to a content-type gradient.
 *
 * Self-wraps in its own <Motion tag="section"> — registered in SELF_WRAPPED_BLOCKS so RenderBlocks
 * does not add a second section/fade wrapper. Gradients are CSS + a local grain asset, so a card
 * renders identically regardless of media availability. Hrefs go through <LocalizedLink> so cards
 * stay inside the active /[locale] segment (WEB-445). Lives inside the home page query (depth 2 +
 * locale), so items populate localized and the whole thing inherits the page's static + tag ISR.
 */

type Tone = 'crimson' | 'violet' | 'emerald' | 'azure' | 'magenta' | 'indigo'

// Rich, multi-stop radial gradients with a warm/cool spread across content types. The origin sits
// top-left so the brightest point reads as a light source the grain texture sits over.
const TONE: Record<Tone, string> = {
  crimson: 'radial-gradient(135% 135% at 18% 12%, #c1285f 0%, #6d1734 42%, #1d0a14 100%)',
  violet: 'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
  emerald: 'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)',
  azure: 'radial-gradient(135% 135% at 22% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
  magenta: 'radial-gradient(135% 135% at 20% 12%, #b6249a 0%, #5e1457 44%, #190a1c 100%)',
  indigo: 'radial-gradient(135% 135% at 22% 14%, #4f6bed 0%, #25307e 44%, #0c1030 100%)',
}

// Tone palette rotated positionally so a hero of mostly one content type keeps its gradient variety.
const TONES: Tone[] = ['crimson', 'violet', 'emerald', 'azure', 'magenta', 'indigo']

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type FeaturedCard = { title: string; category: string; href: string; tone: Tone }

// Per-type label + locale-LESS detail path (LocalizedLink adds the /[locale] prefix).
const TYPE_META = {
  story: { category: 'Case Study', segment: 'stories' },
  insight: { category: 'Insight', segment: 'insights' },
  pressRelease: { category: 'Press Release', segment: 'press-release' },
} as const

/** Map a populated relationship row → a renderable card, or null when unpopulated/untitled. */
function toCard(item: NonNullable<HeroFeaturedBlock['items']>[number], index: number): FeaturedCard | null {
  const value = item.value as Story | Insight | PressRelease | string
  if (typeof value === 'string' || !value?.slug || !value?.title) return null
  const meta = TYPE_META[item.relationTo]
  return {
    title: value.title,
    category: meta.category,
    href: `/${meta.segment}/${value.slug}`,
    tone: TONES[index % TONES.length],
  }
}

function Card({ item, index }: { item: FeaturedCard; index: number }): JSX.Element {
  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.48) }}
    >
      <Link
        href={item.href}
        className="group relative block aspect-[358/585] overflow-hidden rounded-md ring-1 ring-white/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1"
      >
        {/* Gradient field — eases brighter and scales subtly on hover (the "orchestration" beat). */}
        <span
          aria-hidden
          className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          style={{ backgroundImage: TONE[item.tone] }}
        />
        {/* Grain overlay — the brand's signature texture, local asset (no external dependency). */}
        <span
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
        />
        {/* Top-down legibility scrim (Figma: black/60 → transparent by the midpoint) so the
            top-anchored title/category hold on the brightest gradients. */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent to-50%" />

        <div className="relative flex h-full flex-col items-start gap-2 px-6 py-8">
          <h3 className="w-full text-base font-semibold leading-[1.15] text-cream">{item.title}</h3>
          <span className="w-full text-sm font-medium leading-[1.15] text-cream">{item.category}</span>
        </div>
      </Link>
    </Motion>
  )
}

export function HeroFeaturedComponent({ thesis, headline, items }: HeroFeaturedBlock): JSX.Element {
  const cards = (items ?? []).map(toCard).filter((c): c is FeaturedCard => c !== null)
  const headlineLines = (headline ?? '').split('\n').filter(Boolean)

  return (
    <section className="w-full">
      <div className="flex flex-col items-center gap-6 pt-16 pb-4 text-center lg:pt-[72px]">
        {headlineLines.length > 0 && (
          <Motion
            tag="h1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-[clamp(2rem,5vw,2.5rem)] font-medium leading-[1.15] text-cream"
          >
            {headlineLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </Motion>
        )}
        {thesis && (
          <Motion
            tag="p"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="max-w-xl text-base font-medium leading-[1.15] text-body"
          >
            {thesis}
          </Motion>
        )}
      </div>

      {cards.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((card, i) => (
            <Card key={`${card.href}-${i}`} item={card} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}

export default HeroFeaturedComponent
