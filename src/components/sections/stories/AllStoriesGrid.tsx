'use client'

import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { GradientPanel, toneFor, type Tone } from '@/components/sections/stories/gradient'
import { cn } from '@/lib/utils'
import type { Insight, PressRelease, Story } from '@/payload-types'
import { ArrowUpRight, BookOpen, Clock, FileText, FlaskConical, Newspaper, Search, X } from 'lucide-react'
import { useMemo, useState, type JSX } from 'react'

export type StoryGridItem = { relationTo: 'story'; value: Story } | { relationTo: 'insight'; value: Insight }

type ContentType = 'story' | 'insight' | 'pressRelease' | 'research'
type FilterKey = 'all' | ContentType

const FILTER_OPTIONS: { key: ContentType; label: string; icon: typeof BookOpen }[] = [
  { key: 'story', label: 'Case Study', icon: FileText },
  { key: 'pressRelease', label: 'Press Release', icon: Newspaper },
  { key: 'insight', label: 'Thought Piece', icon: BookOpen },
  { key: 'research', label: 'Research Report', icon: FlaskConical },
]

const CATEGORY_LABELS: Record<ContentType, string> = {
  story: 'Case Study',
  insight: 'Thought Piece',
  pressRelease: 'Press Release',
  research: 'Research Report',
}

/** A type-erased card model so stories, insights and press releases render through one card. */
interface NormalizedItem {
  id: string
  type: ContentType
  href: string
  title: string
  excerpt?: string | null
  code?: string | null
  date?: string | null
  readTime?: string | null
  categoryLabel?: string | null
  tone: Tone
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function formatDate(date?: string | null): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function detailHref(type: ContentType, slug: string): string {
  switch (type) {
    case 'story':
    case 'research':
      return `/stories/${slug}`
    case 'insight':
      return `/insights/${slug}`
    case 'pressRelease':
      return `/press-release/${slug}`
  }
}

const motionGridItemProps = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
}

/**
 * Gradient/noise tile card — the design's hero archive card. Eyebrow + title overlay
 * sit on the signature content-type gradient with a scrim for legibility, and a Read
 * affordance reveals on hover.
 */
function GradientTileCard({ item, index }: { item: NormalizedItem; index: number }): JSX.Element {
  return (
    <Motion
      tag="div"
      {...motionGridItemProps}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link
        href={item.href}
        className="group relative block aspect-[3/4] overflow-hidden rounded-md ring-1 ring-white/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <GradientPanel tone={item.tone} interactive />
        <div className="relative flex h-full flex-col p-5">
          <h3 className="max-w-[15rem] text-[17px] font-medium leading-[1.18] tracking-[-0.02em] text-cream">
            {item.title}
          </h3>
          <span className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-cream/75">
            {item.categoryLabel}
          </span>
          <span className="mt-auto inline-flex translate-y-1 items-center gap-1 text-[13px] text-cream/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-cream/90 motion-reduce:translate-y-0 motion-reduce:transition-none">
            Read
            <ArrowUpRight size={16} aria-hidden />
          </span>
        </div>
      </Link>
    </Motion>
  )
}

/**
 * Clean text card — ID badge, Poppins title, Inter excerpt, code + date row, divider,
 * meta (read time · studio) and a Read affordance with an arrow nudge on hover.
 */
function TextCard({ item, index }: { item: NormalizedItem; index: number }): JSX.Element {
  return (
    <Motion
      tag="div"
      {...motionGridItemProps}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.04, 0.4) }}
      className="h-full"
    >
      <Link
        href={item.href}
        className="group flex h-full min-h-[300px] flex-col rounded-md border border-white/5 bg-main p-6 transition-colors duration-300 hover:border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        <span className="mb-4 inline-flex w-fit items-center rounded-md border border-line bg-badge px-3 py-1.5 text-[12px] tracking-[-0.02em] text-body">
          {item.categoryLabel}
        </span>

        <h3 className="mb-3 line-clamp-3 font-display text-xl font-medium leading-[1.18] tracking-[-0.03em] text-cream">
          {item.title}
        </h3>

        {item.excerpt && (
          <p className="mb-5 line-clamp-3 text-[15px] leading-[1.5] tracking-[-0.01em] text-body">{item.excerpt}</p>
        )}

        {(item.code || item.date) && (
          <div className="mt-auto flex items-center justify-between text-[12px] tracking-[-0.02em] text-subtle">
            <span>{item.code ?? ''}</span>
            <span>{formatDate(item.date)}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-subtle/60 pt-4 text-[12px] tracking-[-0.02em] text-body">
          <span className="flex min-w-0 items-center gap-2">
            <Clock size={12} className="shrink-0" aria-hidden />
            <span className="truncate">
              {item.readTime ?? '12 min'}
              {item.categoryLabel ? ` · ${item.categoryLabel}` : ''}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm text-cream transition-all group-hover:gap-2 motion-reduce:group-hover:gap-1">
            Read <ArrowUpRight size={14} aria-hidden />
          </span>
        </div>
      </Link>
    </Motion>
  )
}

interface AllStoriesGridProps {
  heading?: string | null
  description?: string | null
  items?: StoryGridItem[] | null
  pressReleases?: PressRelease[] | null
}

export default function AllStoriesGrid({
  heading,
  description,
  items,
  pressReleases,
}: AllStoriesGridProps): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Normalize stories, insights and press releases into one unified card model.
  const normalized = useMemo<NormalizedItem[]>(() => {
    const fromItems = (items ?? [])
      .filter(
        (item): item is StoryGridItem =>
          typeof item.value === 'object' && item.value !== null && Boolean(item.value.slug),
      )
      .map((item, index): NormalizedItem => {
        const doc = item.value
        const type = item.relationTo as ContentType
        return {
          id: `${type}-${doc.id}`,
          type,
          href: detailHref(type, doc.slug),
          title: doc.title ?? 'Untitled',
          excerpt: doc.excerpts,
          code: 'code' in doc ? doc.code : null,
          date: 'publishedDate' in doc ? doc.publishedDate : null,
          readTime: 'readTime' in doc ? doc.readTime : null,
          categoryLabel: CATEGORY_LABELS[type],
          tone: toneFor(type, index),
        }
      })

    const fromPress = (pressReleases ?? [])
      .filter((pr): pr is PressRelease => typeof pr === 'object' && pr !== null && Boolean(pr.slug))
      .map(
        (pr, index): NormalizedItem => ({
          id: `pressRelease-${pr.id}`,
          type: 'pressRelease',
          href: detailHref('pressRelease', pr.slug),
          title: pr.title ?? 'Untitled',
          excerpt: pr.excerpts,
          code: pr.code,
          date: pr.releaseDate,
          readTime: pr.readTime,
          categoryLabel: CATEGORY_LABELS.pressRelease,
          tone: toneFor('pressRelease', index),
        }),
      )

    return [...fromItems, ...fromPress]
  }, [items, pressReleases])

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = {
      all: normalized.length,
      story: 0,
      insight: 0,
      pressRelease: 0,
      research: 0,
    }
    for (const item of normalized) base[item.type] += 1
    return base
  }, [normalized])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return normalized.filter((item) => {
      const matchesFilter = activeFilter === 'all' || item.type === activeFilter
      const matchesSearch =
        !query || item.title.toLowerCase().includes(query) || item.excerpt?.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [normalized, activeFilter, searchQuery])

  // The design opens the archive with a band of gradient tiles, then text cards beneath.
  const TILE_COUNT = 8
  const tileItems = filtered.slice(0, TILE_COUNT)
  const textItems = filtered.slice(TILE_COUNT)

  const hasSearch = searchQuery.trim().length > 0

  return (
    <section className="mx-auto w-full max-w-7xl px-5">
      {(heading || description) && (
        <div className="mb-6 max-w-3xl space-y-3">
          {heading && (
            <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-medium leading-[1.15] tracking-[-0.04em] text-cream">
              {heading}
            </h2>
          )}
          {description && (
            <p className="text-[15px] leading-[1.55] tracking-[-0.01em] text-body lg:text-base">{description}</p>
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-md border border-white/5 bg-ink/60 p-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill
            label="All"
            count={counts.all}
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          />
          {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
            <FilterPill
              key={key}
              label={label}
              count={counts[key]}
              icon={Icon}
              active={activeFilter === key}
              onClick={() => setActiveFilter(key)}
            />
          ))}
        </div>

        <div className="relative w-full lg:ml-auto lg:w-72">
          <Search
            size={14}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search titles, tags…"
            aria-label="Search stories"
            className="h-9 w-full rounded-md border border-line bg-page pl-10 pr-4 text-sm tracking-[-0.01em] text-cream placeholder:text-subtle focus-visible:border-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cream"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {tileItems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tileItems.map((item, index) => (
                <GradientTileCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}

          {textItems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {textItems.map((item, index) => (
                <TextCard key={item.id} item={item} index={index + tileItems.length} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-md border border-white/5 bg-ink/40 py-16 text-center">
          <p className="text-base tracking-[-0.01em] text-cream">
            {hasSearch ? `No results for “${searchQuery.trim()}”.` : 'Nothing here yet.'}
          </p>
          <p className="max-w-sm text-sm tracking-[-0.01em] text-subtle">
            {hasSearch
              ? 'Try a different search, or clear it to see everything.'
              : 'New case studies, press releases and thought pieces will appear here.'}
          </p>
          {(hasSearch || activeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('all')
              }}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-badge px-4 py-2 text-sm tracking-[-0.01em] text-cream transition-colors hover:border-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              <X size={14} aria-hidden />
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function FilterPill({
  label,
  count,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  count: number
  icon?: typeof BookOpen
  active: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[12px] tracking-[-0.02em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream',
        active ? 'border-cream bg-cream text-ink' : 'border-line bg-badge text-body hover:border-subtle',
      )}
    >
      {Icon && <Icon size={12} aria-hidden />}
      <span>{label}</span>
      <span className={cn(active ? 'text-ink/60' : 'text-subtle')}>{count}</span>
    </button>
  )
}
