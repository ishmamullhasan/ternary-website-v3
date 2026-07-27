'use client'

import MobileCarousel from '@/components/layout/MobileCarousel'
import RichTextComp, { type RichText } from '@/components/richtext'
import {
  CATEGORY_LABELS,
  detailHref,
  InsightImageCard,
  InsightWideCard,
  StoryFeatureCard,
  TextCard,
  type ContentType,
  type NormalizedItem,
} from '@/components/sections/stories/cards'
import { toneFor } from '@/components/sections/stories/gradient'
import { cn } from '@/lib/utils'
import type { Insight, PressRelease, Story } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { BookOpen, FileText, FlaskConical, Newspaper, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState, type JSX } from 'react'

export type StoryGridItem = { relationTo: 'story'; value: Story } | { relationTo: 'insight'; value: Insight }

type FilterKey = 'all' | ContentType

const FILTER_OPTIONS: { key: ContentType; label: string; icon: typeof BookOpen }[] = [
  { key: 'story', label: 'Case Study', icon: FileText },
  { key: 'pressRelease', label: 'Press Release', icon: Newspaper },
  { key: 'insight', label: 'Insights', icon: BookOpen },
  { key: 'research', label: 'Research Report', icon: FlaskConical },
]

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
      .map((pr, index): NormalizedItem => ({
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
      }))

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

      {/* Filter bar — stacks vertically on mobile, single row from lg up. */}
      <div className="mb-8 flex flex-col gap-4 rounded-sm bg-main p-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex shrink-0 items-center gap-2 text-subtle">
            <SlidersHorizontal size={16} aria-hidden />
            <span className="text-[12px] tracking-[-0.05em]">Filter</span>
          </span>

          <div className="-mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
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
        </div>

        <div className="relative w-full shrink-0 lg:w-72">
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
          {/* Case studies — large editorial media-forward cards, one idea per band
              (fantasy.co study): media leads, mono numbered eyebrow, one confident line. */}
          {storyItems.length > 0 && (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 pb-8 md:grid-cols-2 lg:gap-y-16">
              {storyItems.map((item, index) => (
                <StoryFeatureCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}

          {/* Press releases — a row of clean text cards. */}
          {pressItems.length > 0 && (
            <>
              {/* Mobile: horizontal snap carousel with pagination dots. */}
              <MobileCarousel slideClassName="w-[280px]">
                {pressItems.map((item, index) => (
                  <TextCard key={item.id} item={item} index={index} />
                ))}
              </MobileCarousel>

              {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
              <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {pressItems.map((item, index) => (
                  <TextCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </>
          )}

          {/* Insights — a bento of image cards; every fifth card widens to two columns. */}
          {insightItems.length > 0 && (
            <>
              {/* Mobile: horizontal snap carousel — every insight renders as the normal card. */}
              <MobileCarousel slideClassName="w-[280px]">
                {insightItems.map((item, index) => (
                  <InsightImageCard key={item.id} item={item} index={index} />
                ))}
              </MobileCarousel>

              {/* sm+ bento grid — hidden on mobile, where the carousel takes over. */}
              <div className="hidden gap-4 sm:grid md:grid-cols-2 lg:grid-cols-3">
                {insightItems.map((item, index) =>
                  index % 5 === 4 ? (
                    <InsightWideCard key={item.id} item={item} index={index} />
                  ) : (
                    <InsightImageCard key={item.id} item={item} index={index} />
                  ),
                )}
              </div>
            </>
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
        'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[12px] tracking-[-0.05em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream',
        active ? 'border-cream bg-cream text-ink' : 'border-subtle bg-page text-body hover:border-cream',
      )}
    >
      {Icon && <Icon size={12} aria-hidden />}
      <span>{label}</span>
      <span className={cn(active ? 'text-ink/60' : 'text-body')}>{count}</span>
    </button>
  )
}
