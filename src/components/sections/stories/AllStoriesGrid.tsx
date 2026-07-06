'use client'

import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { GradientPanel, toneFor, type Tone } from '@/components/sections/stories/gradient'
import { cn } from '@/lib/utils'
import type { Insight, PressRelease, Story } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  FileText,
  FlaskConical,
  Newspaper,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useMemo, useState, type JSX } from 'react'

export type StoryGridItem = { relationTo: 'story'; value: Story } | { relationTo: 'insight'; value: Insight }

type ContentType = 'story' | 'insight' | 'pressRelease' | 'research'
type FilterKey = 'all' | ContentType

const FILTER_OPTIONS: { key: ContentType; label: string; icon: typeof BookOpen }[] = [
  { key: 'story', label: 'Case Study', icon: FileText },
  { key: 'pressRelease', label: 'Press Release', icon: Newspaper },
  { key: 'insight', label: 'Insights', icon: BookOpen },
  { key: 'research', label: 'Research Report', icon: FlaskConical },
]

/** Pill / type label shown on each card (matches the Figma card badges). */
const CATEGORY_LABELS: Record<ContentType, string> = {
  story: 'Case Study',
  insight: 'Insights',
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
  /** The doc's own category label (e.g. "Engineering Studio") shown in the meta row. */
  studioLabel?: string | null
  /** Resolved thumbnail URL (insights render an image tile; falls back to a gradient). */
  image?: string | null
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
      return `/case-studies/${slug}`
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

/* ------------------------------------------------------------------ */
/* Shared card fragments                                              */
/* ------------------------------------------------------------------ */

/** The rounded outline badge that sits above every card title. */
function CardPill({ label }: { label?: string | null }): JSX.Element | null {
  if (!label) return null
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-subtle bg-main px-4 py-2 font-display text-lg leading-none tracking-[-0.05em] text-cream">
      {label}
    </span>
  )
}

/** Code (e.g. CS-014) on the left, formatted date on the right. */
function CodeDateRow({ item }: { item: NormalizedItem }): JSX.Element | null {
  if (!item.code && !item.date) return null
  return (
    <div className="flex items-center justify-between text-[12px] tracking-[-0.05em] text-body">
      <span>{item.code ?? ''}</span>
      <span>{formatDate(item.date)}</span>
    </div>
  )
}

/** Divider + read-time · studio on the left, a Read affordance that nudges on hover. */
function MetaFooter({ item }: { item: NormalizedItem }): JSX.Element {
  return (
    <div className="flex items-center justify-between border-t border-subtle pt-4 text-[12px] tracking-[-0.05em] text-body">
      <span className="flex min-w-0 items-center gap-2">
        <Clock size={12} className="shrink-0" aria-hidden />
        <span className="truncate">
          {item.readTime ?? '12 min'}
          {item.studioLabel ? ` · ${item.studioLabel}` : ''}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-base text-cream transition-all group-hover:gap-2 motion-reduce:group-hover:gap-1">
        Read <ArrowUpRight size={14} aria-hidden />
      </span>
    </div>
  )
}

/** Image tile for insight cards — real thumbnail when present, signature gradient otherwise. */
function InsightMedia({ item }: { item: NormalizedItem }): JSX.Element {
  if (item.image) {
    return (
      <>
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />
      </>
    )
  }
  return <GradientPanel tone={item.tone} interactive scrim="none" />
}

/* ------------------------------------------------------------------ */
/* Card variants                                                      */
/* ------------------------------------------------------------------ */

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
        className="group relative block aspect-[358/585] overflow-hidden rounded-md ring-1 ring-white/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {/* Single top-down scrim (text is top-anchored in the new Figma tile). */}
        <GradientPanel tone={item.tone} interactive scrim="top" />
        <div className="relative flex h-full flex-col gap-2 px-6 py-8">
          <h3 className="text-[16px] font-semibold leading-[1.15] tracking-[-0.05em] text-cream">{item.title}</h3>
          <span className="text-[14px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
            {item.categoryLabel}
          </span>
        </div>
      </Link>
    </Motion>
  )
}

/**
 * Clean text card (press releases) — ID badge, Poppins title, Inter excerpt, code + date
 * row, divider, meta (read time · studio) and a Read affordance with an arrow nudge on hover.
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
        className="group flex h-full min-h-[300px] flex-col gap-3 rounded-lg border border-line bg-main p-6 transition-colors duration-300 hover:border-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        <CardPill label={item.categoryLabel} />

        <h3 className="line-clamp-3 font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">
          {item.title}
        </h3>

        {item.excerpt && (
          <p className="line-clamp-3 text-base leading-[1.15] tracking-[-0.05em] text-body">{item.excerpt}</p>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <CodeDateRow item={item} />
          <MetaFooter item={item} />
        </div>
      </Link>
    </Motion>
  )
}

/**
 * Insight card — signature image/gradient tile on top, then pill, Poppins title, excerpt,
 * code + date and the meta footer. Fills a single bento column.
 */
function InsightImageCard({ item, index }: { item: NormalizedItem; index: number }): JSX.Element {
  return (
    <Motion
      tag="div"
      {...motionGridItemProps}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
      className="h-full"
    >
      <Link
        href={item.href}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-main transition-colors duration-300 hover:border-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        <div className="relative aspect-[482/440] w-full overflow-hidden">
          <InsightMedia item={item} />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <CardPill label={item.categoryLabel} />
          <h3 className="line-clamp-2 font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="line-clamp-3 text-base leading-[1.15] tracking-[-0.05em] text-body">{item.excerpt}</p>
          )}
          <div className="mt-auto flex flex-col gap-3">
            <CodeDateRow item={item} />
            <MetaFooter item={item} />
          </div>
        </div>
      </Link>
    </Motion>
  )
}

/**
 * Wide insight card (bento accent) — spans two columns: pill + title + excerpt on top, a
 * wide image band in the middle, and the code/date + meta footer beneath.
 */
function InsightWideCard({ item, index }: { item: NormalizedItem; index: number }): JSX.Element {
  return (
    <Motion
      tag="div"
      {...motionGridItemProps}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
      className="h-full md:col-span-2 lg:col-span-2"
    >
      <Link
        href={item.href}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-main transition-colors duration-300 hover:border-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        <div className="flex flex-col gap-3 p-6 pb-4">
          <CardPill label={item.categoryLabel} />
          <h3 className="line-clamp-2 font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="line-clamp-2 text-base leading-[1.15] tracking-[-0.05em] text-body">{item.excerpt}</p>
          )}
        </div>
        <div className="relative min-h-[240px] w-full flex-1 overflow-hidden">
          <InsightMedia item={item} />
        </div>
        <div className="flex flex-col gap-3 p-6 pt-4">
          <CodeDateRow item={item} />
          <MetaFooter item={item} />
        </div>
      </Link>
    </Motion>
  )
}

interface AllStoriesGridProps {
  heading?: string | null
  // Rich text (Lexical) or a legacy plain string — RichTextComp renders both.
  description?: RichText | string | null
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
        const rawRead = 'readTime' in doc ? (doc as { readTime?: unknown }).readTime : null
        const thumb = 'thumbnail' in doc ? doc.thumbnail : null
        return {
          id: `${type}-${doc.id}`,
          type,
          href: detailHref(type, doc.slug),
          title: doc.title ?? 'Untitled',
          excerpt: doc.excerpts,
          code: 'code' in doc ? doc.code : null,
          date: 'publishedDate' in doc ? doc.publishedDate : null,
          readTime:
            typeof rawRead === 'number' ? `${rawRead} min` : typeof rawRead === 'string' && rawRead ? rawRead : null,
          studioLabel: 'categoryLabel' in doc ? (doc.categoryLabel as string | null) : null,
          image: thumb && typeof thumb === 'object' ? getMediaUrl(thumb.url, thumb.updatedAt) : null,
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
          studioLabel: pr.categoryLabel,
          image:
            pr.thumbnail && typeof pr.thumbnail === 'object'
              ? getMediaUrl(pr.thumbnail.url, pr.thumbnail.updatedAt)
              : null,
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

  // The design lays the archive out in three type-specific bands: case-study gradient tiles,
  // a row of press-release text cards, then an insights bento (image cards + one wide accent).
  const storyItems = useMemo(() => filtered.filter((i) => i.type === 'story' || i.type === 'research'), [filtered])
  const pressItems = useMemo(() => filtered.filter((i) => i.type === 'pressRelease'), [filtered])
  const insightItems = useMemo(() => filtered.filter((i) => i.type === 'insight'), [filtered])

  const hasSearch = searchQuery.trim().length > 0

  return (
    <section className="w-full">
      {(heading || description) && (
        <div className="mb-6 flex max-w-[724px] flex-col gap-4">
          {heading && (
            <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-medium leading-[1.15] tracking-[-0.05em] text-cream opacity-90">
              {heading}
            </h2>
          )}
          {description && (
            <RichTextComp
              content={description}
              className="opacity-90 prose-p:mb-0 prose-p:text-base prose-p:font-normal prose-p:leading-[1.15] prose-p:tracking-[-0.05em] prose-p:text-body"
            />
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-8 flex items-center gap-4 rounded-sm bg-main p-4">
        <span className="flex shrink-0 items-center gap-2 text-subtle">
          <SlidersHorizontal size={16} aria-hidden />
          <span className="text-[12px] tracking-[-0.05em]">Filter</span>
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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

        <div className="relative w-72 shrink-0">
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
            className="h-9 w-full rounded-full border border-subtle bg-page pl-10 pr-4 text-sm tracking-[-0.01em] text-cream placeholder:text-body focus-visible:border-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cream"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {/* Case studies — up to two rows of gradient tiles. */}
          {storyItems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {storyItems.map((item, index) => (
                <GradientTileCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}

          {/* Press releases — a row of clean text cards. */}
          {pressItems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pressItems.map((item, index) => (
                <TextCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}

          {/* Insights — a bento of image cards; every fifth card widens to two columns. */}
          {insightItems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {insightItems.map((item, index) =>
                index % 5 === 4 ? (
                  <InsightWideCard key={item.id} item={item} index={index} />
                ) : (
                  <InsightImageCard key={item.id} item={item} index={index} />
                ),
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-md border border-line bg-main py-16 text-center">
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
              className="inline-flex items-center gap-2 rounded-full border border-subtle bg-page px-4 py-2 text-sm tracking-[-0.05em] text-cream transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
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
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] tracking-[-0.05em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream',
        active ? 'border-cream bg-cream text-ink' : 'border-subtle bg-page text-body hover:border-cream',
      )}
    >
      {Icon && <Icon size={12} aria-hidden />}
      <span>{label}</span>
      <span className={cn(active ? 'text-ink/60' : 'text-body')}>{count}</span>
    </button>
  )
}
