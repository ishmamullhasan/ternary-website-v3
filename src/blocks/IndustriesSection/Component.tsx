import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { IndustriesSectionBlock, Industry, Media } from '@/payload-types'
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
import Image from 'next/image'
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

type ImageTile = { key: string; imageUrl?: string; alt: string; href: string }

// Two renderings share this block:
//   • Home (default, !fullWidth) — a plain image grid: portrait tiles that are JUST an image + a
//     link, nothing else (Figma 339-8110). The images come from the block's `images` array (pick a
//     media image + link per tile); if none are set it falls back to the selected industries'
//     thumbnails so existing content keeps working.
//   • fullWidth — the industry-detail benefit grid: icon chip + title + paragraph cards
//     (Figma 1283-2668). Driven by `industries`. Left untouched.
export function IndustriesSectionComponent({
  heading,
  description,
  images,
  industries,
  fullWidth,
}: IndustriesSectionBlock): JSX.Element | null {
  const items = (industries ?? []).filter((i): i is Industry => typeof i === 'object' && i !== null)

  // Explicitly-picked media tiles take priority over the industry-thumbnail fallback.
  const pickedTiles: ImageTile[] = (images ?? []).flatMap((tile, i) => {
    const media = tile?.image as Media | null | undefined
    if (!media || typeof media !== 'object' || !media.url) return []
    return [{ key: tile.id ?? `img-${i}`, imageUrl: media.url, alt: media.alt || 'industry', href: tile.link || '#' }]
  })
  const fallbackTiles: ImageTile[] = items.map((item, i) => {
    const thumb = item.thumbnail as Media | null | undefined
    return {
      key: item.id ?? `ind-${i}`,
      imageUrl: typeof thumb === 'object' && thumb ? (thumb.url ?? undefined) : undefined,
      alt: item.title || 'industry',
      href: item.slug ? `/industries/${item.slug}` : '#',
    }
  })
  const tiles = pickedTiles.length > 0 ? pickedTiles : fallbackTiles

  // Nothing to show: fullWidth needs industries; the image grid needs either source.
  if (fullWidth ? items.length === 0 : tiles.length === 0) return null

  return (
    // Default: the cards sit inside a raised `section-card` panel (home/capabilities treatment).
    // Full-width mode drops that panel — otherwise the section surface and the cards are the same
    // `#1b1a17` token, so the cards vanish. With no panel, the `bg-card` cards read against the
    // darker page, matching the industry-detail benefit grid (Figma 1283-2668).
    <Motion tag="section" className={fullWidth ? 'w-full' : 'section-card w-full'}>
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
          {description && (
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
            />
          )}
        </Motion>
      )}

      <div
        className={
          fullWidth
            ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5'
        }
      >
        {/* Default: empty left gutter (desktop) so the 8 cards sit in columns 2–5 — matching the
            Capabilities section. Full-width mode drops the gutter for the flush 4-column benefit grid
            on the industry-detail page (Figma 1283-2668). */}
        {!fullWidth && <div aria-hidden className="hidden lg:block lg:row-span-2" />}

        {/* Home image grid — each tile is JUST an image + a link (no icon/title/excerpt). */}
        {!fullWidth &&
          tiles.map((tile, index) => (
            <Motion
              key={tile.key}
              tag="div"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
            >
              <Link
                href={tile.href}
                aria-label={tile.alt}
                className={`group relative block aspect-[3/4] overflow-hidden rounded-md border border-white/[0.06] bg-ink transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
              >
                {tile.imageUrl && (
                  <Image
                    src={tile.imageUrl}
                    alt={tile.alt}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                )}
              </Link>
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
