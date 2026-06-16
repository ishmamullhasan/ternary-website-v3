'use client'

import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { Insight, Media, PressRelease, Story } from '@/payload-types'
import { ArrowUpRight, BookOpen, Clock, FileText, Filter, Newspaper, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, type JSX } from 'react'

export type StoryGridItem = { relationTo: 'story'; value: Story } | { relationTo: 'insight'; value: Insight }

type FilterKey = 'all' | 'story' | 'insight'

const FILTER_OPTIONS: { key: FilterKey; label: string; icon: typeof BookOpen }[] = [
  { key: 'all', label: 'All', icon: BookOpen },
  { key: 'story', label: 'Case Study', icon: FileText },
  { key: 'insight', label: 'Thought Piece', icon: BookOpen },
]

const CATEGORY_LABELS: Record<Exclude<FilterKey, 'all'>, string> = {
  story: 'Case Study',
  insight: 'Thought Piece',
}

function getStoryItemHref(item: StoryGridItem): string {
  if (typeof item.value === 'string' || !item.value.slug) return '#'

  switch (item.relationTo) {
    case 'story':
      return `/stories/${item.value.slug}`
    case 'insight':
      return `/insights/${item.value.slug}`
    default:
      return '#'
  }
}

function getPressReleaseHref(item: PressRelease): string {
  if (!item.slug) return '#'
  return `/press-release/${item.slug}`
}

function formatDate(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface AllStoriesGridProps {
  heading?: string | null
  description?: string | null
  items?: StoryGridItem[] | null
  pressReleases?: PressRelease[] | null
}

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

function AboutStyleStoryCard({ item, index }: { item: StoryGridItem; index: number }) {
  const doc = item.value
  const href = getStoryItemHref(item)
  const thumbnail = typeof doc.thumbnail === 'object' ? (doc.thumbnail as Media) : null

  return (
    <Link href={href}>
      <Motion
        className="relative lg:w-[300px] lg:h-[480px] w-[280px] rounded-lg overflow-hidden"
        {...motionGridItemProps}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
          delay: index * 0.05,
        }}
      >
        {thumbnail?.url ? (
          <Image
            src={thumbnail.url}
            alt={thumbnail.alt || doc.title || 'story'}
            height={thumbnail.height || 480}
            width={thumbnail.width || 300}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-pink-500 via-purple-500 to-blue-500" />
        )}

        <div className="absolute top-5 left-5 right-5">
          <p className="lg:text-base text-xs">{doc.excerpts}</p>
          <p className="lg:text-sm">{doc.title}</p>
        </div>
      </Motion>
    </Link>
  )
}

function StoryCard({ item, index }: { item: StoryGridItem; index: number }) {
  const doc = item.value
  const href = getStoryItemHref(item)
  const category = CATEGORY_LABELS[item.relationTo]

  return (
    <Link href={href} className="group block h-full">
      <Motion
        className="bg-main border border-zinc-800/40 rounded-lg p-6 h-full min-h-[330px] flex flex-col transition-colors duration-300 hover:border-zinc-700/60"
        {...motionGridItemProps}
        transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.04 }}
      >
        <span className="inline-flex self-start items-center rounded-full border border-zinc-700/60 bg-[#14120B] px-4 py-2 text-xs text-[#D5D5D5] mb-4">
          {category}
        </span>

        <h3 className="text-lg lg:text-xl font-medium tracking-tight text-white mb-3 line-clamp-3">{doc.title}</h3>

        {doc.excerpts && <p className="text-sm text-[#D5D5D5] leading-relaxed line-clamp-3 mb-auto">{doc.excerpts}</p>}

        <div className="flex items-center justify-between pt-5 mt-5 border-t border-zinc-800/60 text-xs text-[#757571]">
          <div className="flex items-center gap-2 min-w-0">
            <Clock size={12} className="shrink-0" />
            <span className="truncate">12 min · {category}</span>
          </div>
          <span className="flex items-center gap-1 text-sm text-white shrink-0 group-hover:gap-2 transition-all">
            Read <ArrowUpRight size={14} />
          </span>
        </div>
      </Motion>
    </Link>
  )
}

function PressReleaseCard({ item, index }: { item: PressRelease; index: number }) {
  const href = getPressReleaseHref(item)

  return (
    <Link href={href} className="group block h-full">
      <Motion
        className="bg-main border border-zinc-800/40 rounded-lg p-6 h-full min-h-[330px] flex flex-col transition-colors duration-300 hover:border-zinc-700/60"
        {...motionGridItemProps}
        transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.04 }}
      >
        <span className="inline-flex self-start items-center gap-2 rounded-full border border-zinc-700/60 bg-[#14120B] px-4 py-2 text-xs text-[#D5D5D5] mb-4">
          <Newspaper size={12} />
          Press Release
        </span>

        <h3 className="text-lg lg:text-xl font-medium tracking-tight text-white mb-3 line-clamp-3">{item.title}</h3>

        {item.excerpts && (
          <p className="text-sm text-[#D5D5D5] leading-relaxed line-clamp-3 mb-auto">{item.excerpts}</p>
        )}

        {(item.code || item.releaseDate) && (
          <div className="flex items-center justify-between mt-auto pt-4 text-xs text-[#757571]">
            <span>{item.code ?? ''}</span>
            <span>{item.releaseDate ? formatDate(item.releaseDate) : ''}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-5 mt-5 border-t border-zinc-800/60 text-xs text-[#757571]">
          {(item.readTime || item.categoryLabel) && (
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={12} className="shrink-0" />
              <span className="truncate">
                {item.readTime}
                {item.readTime && item.categoryLabel ? ' · ' : ''}
                {item.categoryLabel}
              </span>
            </div>
          )}
          <span className="flex items-center gap-1 text-sm text-white shrink-0 ml-auto group-hover:gap-2 transition-all">
            Read <ArrowUpRight size={14} />
          </span>
        </div>
      </Motion>
    </Link>
  )
}

export default function AllStoriesGrid({
  heading,
  description,
  items,
  pressReleases,
}: AllStoriesGridProps): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedItems = useMemo(
    () =>
      (items ?? []).filter(
        (item): item is StoryGridItem =>
          typeof item.value === 'object' && item.value !== null && Boolean(item.value.slug),
      ),
    [items],
  )

  const filteredItems = useMemo(() => {
    return normalizedItems.filter((item) => {
      const matchesFilter = activeFilter === 'all' || item.relationTo === activeFilter
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query || item.value.title?.toLowerCase().includes(query) || item.value.excerpts?.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [normalizedItems, activeFilter, searchQuery])

  const counts = useMemo(() => {
    return {
      all: normalizedItems.length,
      story: normalizedItems.filter((item) => item.relationTo === 'story').length,
      insight: normalizedItems.filter((item) => item.relationTo === 'insight').length,
    }
  }, [normalizedItems])

  const imageItems = filteredItems.filter((_, index) => index < 8)
  const textItems = filteredItems.filter((_, index) => index >= 8 && index < 12)

  return (
    <section className="w-full lg:m-0 m-4 space-y-8">
      {(heading || description) && (
        <div className="space-y-3 max-w-3xl">
          {heading && <h2 className="lg:text-3xl text-2xl font-medium tracking-tight text-white">{heading}</h2>}
          {description && <p className="lg:text-sm text-xs text-[#D5D5D5] leading-relaxed">{description}</p>}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-lg border border-zinc-800/40 bg-[#14120B]/50">
        <div className="flex items-center gap-2 text-xs text-[#757571] shrink-0">
          <Filter size={14} />
          <span>Filter</span>
        </div>

        <div className="flex flex-wrap gap-2 flex-1">
          {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs border transition-colors',
                activeFilter === key
                  ? 'bg-white text-[#0F0E0E] border-white'
                  : 'bg-transparent text-[#D5D5D5] border-zinc-700/60 hover:border-zinc-600',
              )}
            >
              {key !== 'all' && <Icon size={12} />}
              <span>{label}</span>
              <span className={cn('opacity-70', activeFilter === key && 'text-[#0F0E0E]/70')}>{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757571]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search titles, tags…"
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-[#0F0E0E] border border-zinc-800/60 text-sm text-white placeholder:text-[#757571] focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {imageItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {imageItems.map((item, index) => (
                <AboutStyleStoryCard key={`${item.relationTo}-${item.value.id}`} item={item} index={index} />
              ))}
            </div>
          )}

          {textItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {textItems.map((item, index) => (
                <StoryCard key={`${item.relationTo}-${item.value.id}`} item={item} index={index + imageItems.length} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#757571] py-12 text-center">No stories match your filters.</p>
      )}

      {pressReleases && pressReleases.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-zinc-800/40">
          <h3 className="text-xl font-medium text-white">Press Releases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pressReleases.map((item, index) => (
              <PressReleaseCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
