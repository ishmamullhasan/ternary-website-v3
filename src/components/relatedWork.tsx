import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'
import type { Story } from '@/payload-types'
import config from '@/payload.config'
import { ArrowUpRight } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// ---------------------------------------------------------------------------------------------
// "Related work" — a small, guarded proof strip for detail pages whose collections have no
// case-study field of their own (solutions, industries). The page supplies a hand-mapped list of
// story slugs (real engagements only — mapping lives with the page, content lives in the CMS);
// this module fetches the published stories and renders them as cards in the capability page's
// related-card styling, linking to /case-studies/<slug>. Nothing renders when no mapped story is
// published, so the section can never show an empty shell or a dangling heading.
// ---------------------------------------------------------------------------------------------

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.6, ease: EASE },
}

const revealItem = (index: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.55, ease: EASE, delay: Math.min(index * 0.07, 0.42) },
})

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

/**
 * Published stories for a hand-mapped slug list, in the mapped order. Cached on the `story` tag so
 * story edits bust every page that embeds a related-work strip. Draft stories are filtered out —
 * a mapped-but-unpublished story simply doesn't show (guarded degradation, never a dead link).
 */
export async function getRelatedWorkStories(slugs: string[], locale: TypedLocale): Promise<Story[]> {
  if (slugs.length === 0) return []
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'story',
        where: {
          and: [{ slug: { in: slugs } }, { _status: { equals: 'published' } }],
        },
        locale,
        limit: slugs.length,
        depth: 0,
      })
      const bySlug = new Map((result.docs as Story[]).map((doc) => [doc.slug, doc]))
      return slugs.map((slug) => bySlug.get(slug)).filter((doc): doc is Story => Boolean(doc))
    },
    ['related_work', slugs.join(','), locale, 'v1'],
    { tags: ['story'] },
  )()
}

/** Section marker matching the detail routes: "Section 02 / Related work". */
function SectionMarker({ index, label }: { index: number; label: string }): JSX.Element {
  return (
    <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-subtle">
      <span className="tabular-nums text-cream/70">{`Section ${String(index).padStart(2, '0')}`}</span>
      <span aria-hidden className="text-subtle/50">
        /
      </span>
      <span>{label}</span>
    </p>
  )
}

/**
 * Presentational strip. The caller fetches (so it can compute section numbering from whether this
 * section renders) and passes the stories in; an empty list renders nothing.
 */
export function RelatedWorkSection({
  stories,
  locale,
  sectionIndex,
  heading = 'Work behind this offering',
}: {
  stories: Story[]
  locale: TypedLocale
  sectionIndex: number
  heading?: string
}): JSX.Element | null {
  if (stories.length === 0) return null

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.8fr_2.2fr] lg:gap-12">
        <Motion className="flex flex-col gap-4" {...reveal}>
          <SectionMarker index={sectionIndex} label="Related work" />
          <p className="max-w-xs font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium leading-tight tracking-[-0.02em] text-cream">
            {heading}
          </p>
        </Motion>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, i) => (
            <Motion key={story.id ?? `related-work-${i}`} className="h-full" {...revealItem(i)}>
              <Link
                href={`/${locale}/case-studies/${story.slug}`}
                className={cn(
                  'group flex h-full flex-col gap-2 rounded-md border border-white/[0.07] bg-ink p-5 transition-colors duration-300 hover:border-white/[0.16]',
                  FOCUS_RING,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-medium tracking-[-0.02em] text-cream">{story.title}</h3>
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2}
                    aria-hidden
                    className="shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream"
                  />
                </div>
                {story.excerpts && <p className="text-[13px] leading-relaxed text-subtle">{story.excerpts}</p>}
              </Link>
            </Motion>
          ))}
        </div>
      </div>
    </section>
  )
}
