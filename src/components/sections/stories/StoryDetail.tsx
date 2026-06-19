import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { GradientPanel, type Tone, toneFor } from '@/components/sections/stories/gradient'
import type { Story } from '@/payload-types'
import { ArrowLeft, ArrowUpRight, Briefcase, Building2, CalendarDays, Clock, Users } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** A related-story card for the carousel — uses the signature gradient/noise media. */
export interface RelatedStoryCardData {
  href: string
  title: string
  excerpt?: string | null
  code?: string | null
  date?: string | null
  readTime?: string | null
  categoryLabel?: string | null
  tone: Tone
}

interface StoryDetailProps {
  story: Story
  backHref: string
  related?: RelatedStoryCardData[]
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
}

function MetaCell({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-badge bg-ink p-4">
      <span className="flex items-center gap-2 text-[12px] tracking-[-0.02em] text-subtle">
        <Icon size={14} aria-hidden />
        {label}
      </span>
      <span className="text-[15px] tracking-[-0.01em] text-cream">{value}</span>
    </div>
  )
}

export default function StoryDetail({ story, backHref, related = [] }: StoryDetailProps): JSX.Element {
  const tags = (story as { tags?: { name?: string | null }[] | null }).tags?.filter((t) => t?.name) ?? []
  const heroTone = toneFor('story', 0)

  // Derive the 5-cell meta strip from whatever the doc carries; only render cells with values.
  const metaCells: { icon: typeof Building2; label: string; value: string }[] = []
  const meta = (story as { caseMeta?: Record<string, string | null | undefined> }).caseMeta
  if (meta?.industry) metaCells.push({ icon: Building2, label: 'Industry', value: meta.industry })
  if (meta?.engagement) metaCells.push({ icon: Briefcase, label: 'Engagement', value: meta.engagement })
  if (meta?.duration) metaCells.push({ icon: Clock, label: 'Duration', value: meta.duration })
  if (meta?.team) metaCells.push({ icon: Users, label: 'Team', value: meta.team })
  if (meta?.year) metaCells.push({ icon: CalendarDays, label: 'Year', value: meta.year })

  const hasBody = Boolean(story.content)

  return (
    <article className="w-full">
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-5 pt-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-md text-[13px] tracking-[-0.01em] text-subtle transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <ArrowLeft size={14} aria-hidden />
          All case studies
        </Link>
      </div>

      {/* Hero */}
      <header className="mx-auto w-full max-w-7xl px-5 pt-10 lg:pt-14">
        <Motion tag="div" {...reveal} transition={{ duration: 0.7, ease: EASE }} className="max-w-4xl">
          <h1 className="font-display text-[clamp(2rem,5vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.04em] text-cream">
            {story.title}
          </h1>
          {story.excerpts && (
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.55] tracking-[-0.01em] text-body lg:text-base">
              {story.excerpts}
            </p>
          )}
          {tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <li
                  key={`${tag.name}-${i}`}
                  className="rounded-full border border-badge px-3 py-1 text-[13px] tracking-[-0.01em] text-body"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </Motion>

        {metaCells.length > 0 && (
          <Motion
            tag="div"
            {...reveal}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {metaCells.map((cell) => (
              <MetaCell key={cell.label} {...cell} />
            ))}
          </Motion>
        )}
      </header>

      {/* Signature gradient/noise hero panel — the artwork, never a photo. */}
      <Motion
        tag="div"
        {...reveal}
        transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
        className="mx-auto mt-10 w-full max-w-7xl px-5 lg:mt-14"
      >
        <div className="relative h-[260px] w-full overflow-hidden rounded-md ring-1 ring-white/5 lg:h-[440px]">
          <GradientPanel tone={heroTone} />
        </div>
      </Motion>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl px-5 py-16 lg:py-24">
        {hasBody ? (
          <Motion
            tag="div"
            {...reveal}
            transition={{ duration: 0.6, ease: EASE }}
            className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16"
          >
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[12px] uppercase tracking-[0.14em] text-subtle">The story</p>
              <p className="mt-3 text-[15px] leading-[1.5] tracking-[-0.01em] text-body">
                How we approached the work, what we built, and why it matters.
              </p>
            </div>
            <div className="max-w-[74ch] [&_a]:text-cream [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-subtle [&_blockquote]:pl-5 [&_h2]:font-display [&_h3]:font-display [&_p]:tracking-[-0.01em]">
              <RichTextComp content={story.content as RichText} />
            </div>
          </Motion>
        ) : (
          <Motion
            tag="div"
            {...reveal}
            transition={{ duration: 0.6, ease: EASE }}
            className="rounded-md border border-white/5 bg-ink/40 px-6 py-16 text-center"
          >
            <p className="text-base tracking-[-0.01em] text-cream">The full write-up is on its way.</p>
            <p className="mx-auto mt-2 max-w-md text-sm tracking-[-0.01em] text-subtle">
              We’re still documenting this engagement. In the meantime, explore our other case studies below.
            </p>
          </Motion>
        )}
      </div>

      {/* Related stories */}
      {related.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-5 pb-16 lg:pb-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-medium tracking-[-0.04em] text-cream">
              Related stories.
            </h2>
            <Link
              href={backHref}
              className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm tracking-[-0.01em] text-cream transition-colors hover:text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              All case studies <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((card, index) => (
              <RelatedStoryCard key={card.href} card={card} index={index} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

function RelatedStoryCard({ card, index }: { card: RelatedStoryCardData; index: number }): JSX.Element {
  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Link
        href={card.href}
        className="group flex h-full flex-col overflow-hidden rounded-md border border-white/5 bg-main transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="relative h-[200px] w-full overflow-hidden">
          <GradientPanel tone={card.tone} interactive />
          <div className="relative flex h-full flex-col justify-between p-5">
            <span className="inline-flex w-fit items-center rounded-full bg-black/30 px-3 py-1 text-[13px] tracking-[-0.01em] text-cream backdrop-blur-sm">
              {card.categoryLabel ?? 'Case Study'}
            </span>
            {(card.code || card.date) && (
              <div className="flex items-center justify-between text-[12px] tracking-[-0.02em] text-cream/85">
                <span>{card.code ?? ''}</span>
                <span>{card.date ?? ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="line-clamp-2 font-display text-xl font-medium leading-[1.18] tracking-[-0.03em] text-cream">
            {card.title}
          </h3>
          {card.excerpt && (
            <p className="mt-3 line-clamp-2 text-[15px] leading-[1.5] tracking-[-0.01em] text-body">{card.excerpt}</p>
          )}
          <div className="mt-5 flex items-center justify-between border-t border-subtle/60 pt-4 text-[12px] tracking-[-0.02em] text-body">
            <span className="truncate">
              {card.readTime ?? '12 min'} · {card.categoryLabel ?? 'Engineering Studio'}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-sm text-cream transition-all group-hover:gap-2 motion-reduce:group-hover:gap-1">
              Read <ArrowUpRight size={14} aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </Motion>
  )
}

export { RelatedStoryCard }
