import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { GradientPanel, type Tone, toneFor } from '@/components/sections/stories/gradient'
import type { Story } from '@/payload-types'
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Quote as QuoteIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
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
    <div className="flex flex-col gap-2 rounded-lg border border-badge bg-main p-6">
      <span className="flex items-center gap-2 text-[12px] text-subtle">
        <Icon size={14} aria-hidden />
        {label}
      </span>
      <span className="text-base text-cream">{value}</span>
    </div>
  )
}

/**
 * Optional structured case-study fields. These are not (yet) part of the
 * generated `Story` type, so we describe their shapes locally and read them
 * defensively via {@link StoryExtra}; when absent the component falls back to
 * the flat `content` rendering below.
 */
interface BodySection {
  label?: string | null
  heading?: string | null
  lede?: string | null
  body?: RichText | null
  id?: string | null
}
interface OutcomeStat {
  value?: string | null
  label?: string | null
  detail?: string | null
  id?: string | null
}
interface StoryQuote {
  text?: string | null
  name?: string | null
  role?: string | null
}

type StoryExtra = Story & {
  bodySections?: (BodySection | null)[] | null
  outcomeStats?: (OutcomeStat | null)[] | null
  quote?: StoryQuote | null
  code?: string | null
  readTime?: number | null
  tags?: { name?: string | null }[] | null
}

/**
 * One numbered case-study section (Figma 1556:7370): a left rail carrying the
 * Caption label, the Poppins section heading and the lede, paired with the
 * RichText body column on the right.
 */
function BodySectionRow({ section, index }: { section: BodySection; index: number }): JSX.Element {
  // Use the authored label when present; otherwise synthesise a "0N" prefix so the
  // numbered rhythm of the layout still reads correctly.
  const number = String(index + 1).padStart(2, '0')
  const label = section.label?.trim() || number
  return (
    <Motion
      tag="div"
      {...reveal}
      transition={{ duration: 0.6, ease: EASE }}
      className="grid gap-8 border-t border-line py-12 lg:grid-cols-[386px_minmax(0,1fr)] lg:gap-12 lg:py-16"
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-[12px] tracking-[-0.01em] text-subtle">{label}</p>
        {section.heading && (
          <h2 className="mt-3 font-display text-[30px] font-medium leading-[1.15] tracking-[-0.03em] text-cream">
            {section.heading}
          </h2>
        )}
        {section.lede && <p className="mt-3 text-base leading-[1.55] text-body">{section.lede}</p>}
      </div>
      {section.body && (
        <div className="max-w-[72ch] text-base leading-[1.6] text-body [&_a]:text-cream [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-subtle [&_blockquote]:pl-5 [&_h2]:font-display [&_h3]:font-display [&_p]:mt-0 [&_p+p]:mt-4">
          <RichTextComp content={section.body as RichText} />
        </div>
      )}
    </Motion>
  )
}

/** A single headline metric in the 4-up outcome row. */
function OutcomeStatCard({ stat }: { stat: OutcomeStat }): JSX.Element {
  return (
    <div className="flex flex-col rounded-lg border border-badge bg-main p-6">
      <TrendingUp size={16} className="text-subtle" aria-hidden />
      <span className="mt-6 font-display text-[30px] font-medium leading-[1.1] tracking-[-0.03em] text-cream">
        {stat.value}
      </span>
      <span className="mt-3 text-base text-cream">{stat.label}</span>
      {stat.detail && <span className="mt-2 text-[12px] leading-[1.4] text-subtle">{stat.detail}</span>}
    </div>
  )
}

/** Pull-quote / testimonial block. */
function QuoteBlock({ quote }: { quote: StoryQuote }): JSX.Element {
  const initial = quote.name?.trim()?.charAt(0)?.toUpperCase()
  return (
    <figure className="rounded-lg border border-badge bg-main p-6">
      <QuoteIcon size={24} className="text-subtle" aria-hidden />
      {quote.text && (
        <blockquote className="mt-6 font-display text-2xl font-medium leading-[1.3] tracking-[-0.02em] text-cream">
          {quote.text}
        </blockquote>
      )}
      {(quote.name || quote.role) && (
        <figcaption className="mt-6 flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-badge text-sm text-cream"
            aria-hidden
          >
            {initial ?? ''}
          </span>
          <span className="flex flex-col">
            {quote.name && <span className="text-base text-cream">{quote.name}</span>}
            {quote.role && <span className="text-[12px] text-subtle">{quote.role}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  )
}

export default function StoryDetail({ story, backHref, related = [] }: StoryDetailProps): JSX.Element {
  const s = story as StoryExtra
  const tags = s.tags?.filter((t) => t?.name) ?? []
  const heroTone = toneFor('story', 0)

  // Derive the 5-cell meta strip from whatever the doc carries; only render cells with values.
  const metaCells: { icon: typeof Building2; label: string; value: string }[] = []
  const meta = s.caseMeta
  if (meta?.industry) metaCells.push({ icon: Building2, label: 'Industry', value: meta.industry })
  if (meta?.engagement) metaCells.push({ icon: Briefcase, label: 'Engagement', value: meta.engagement })
  if (meta?.duration) metaCells.push({ icon: Clock, label: 'Duration', value: meta.duration })
  if (meta?.team) metaCells.push({ icon: Users, label: 'Team', value: meta.team })
  if (meta?.year) metaCells.push({ icon: CalendarDays, label: 'Year', value: meta.year })

  const hasBody = Boolean(story.content)

  // New optional structured fields (regenerated types). Render the numbered
  // multi-section layout only when bodySections carries usable entries; otherwise
  // fall back to the flat content rendering below, unchanged.
  const bodySections = (s.bodySections ?? []).filter((sec): sec is BodySection =>
    Boolean(sec && (sec.heading || sec.lede || sec.body || sec.label)),
  )
  const hasBodySections = bodySections.length > 0
  const outcomeStats = (s.outcomeStats ?? []).filter((stat): stat is OutcomeStat =>
    Boolean(stat && (stat.value || stat.label)),
  )
  const quote = s.quote
  const hasQuote = Boolean(quote && (quote.text || quote.name || quote.role))

  // Story-level meta for the hero (only render when authored).
  const heroMeta: string[] = []
  if (s.code) heroMeta.push(s.code)
  if (typeof s.readTime === 'number' && s.readTime > 0) {
    heroMeta.push(`${s.readTime} min read`)
  }

  return (
    <article className="w-full">
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-5 pt-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-md text-[14px] text-subtle transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <ArrowLeft size={14} aria-hidden />
          All case studies
        </Link>
      </div>

      {/* Hero */}
      <header className="mx-auto w-full max-w-7xl px-5 pt-10 lg:pt-14">
        <Motion tag="div" {...reveal} transition={{ duration: 0.7, ease: EASE }} className="max-w-4xl">
          <h1 className="text-display text-cream">{story.title}</h1>
          {story.excerpts && <p className="mt-5 max-w-2xl text-base leading-[1.55] text-body">{story.excerpts}</p>}
          {tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <li
                  key={`${tag.name}-${i}`}
                  className="rounded-full border border-badge px-3 py-1 text-[13px] text-body"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
          {heroMeta.length > 0 && (
            <p className="mt-5 flex items-center gap-2 text-[12px] text-subtle">
              {heroMeta.map((item, i) => (
                <span key={item} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>·</span>}
                  {item}
                </span>
              ))}
            </p>
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
        <div className="relative h-[260px] w-full overflow-hidden rounded-lg ring-1 ring-white/5 lg:h-[440px]">
          <GradientPanel tone={heroTone} />
        </div>
      </Motion>

      {/* Body */}
      {hasBodySections ? (
        <div className="mx-auto w-full max-w-7xl px-5 py-16 lg:py-24">
          {/* Numbered multi-section layout (Figma 1556:7370). */}
          <div className="border-b border-line">
            {bodySections.map((section, index) => (
              <BodySectionRow key={section.id ?? index} section={section} index={index} />
            ))}
          </div>

          {/* Outcome stats — 4-up metric row. */}
          {outcomeStats.length > 0 && (
            <Motion
              tag="div"
              {...reveal}
              transition={{ duration: 0.6, ease: EASE }}
              className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
            >
              {outcomeStats.map((stat, index) => (
                <OutcomeStatCard key={stat.id ?? index} stat={stat} />
              ))}
            </Motion>
          )}

          {/* Quote / testimonial. */}
          {hasQuote && quote && (
            <Motion tag="div" {...reveal} transition={{ duration: 0.6, ease: EASE, delay: 0.06 }} className="mt-4">
              <QuoteBlock quote={quote} />
            </Motion>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl px-5 py-16 lg:py-24">
          {hasBody ? (
            <Motion
              tag="div"
              {...reveal}
              transition={{ duration: 0.6, ease: EASE }}
              className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16"
            >
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-[12px] text-subtle">The story</p>
                <p className="mt-3 text-base leading-[1.5] text-body">
                  How we approached the work, what we built, and why it matters.
                </p>
              </div>
              <div className="max-w-[66ch] text-base text-body [&_a]:text-cream [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-subtle [&_blockquote]:pl-5 [&_h2]:font-display [&_h3]:font-display">
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
      )}

      {/* Related stories */}
      {related.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-5 pb-16 lg:pb-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-cream">Related stories.</h2>
            <Link
              href={backHref}
              className="inline-flex shrink-0 items-center gap-1 rounded-md text-base text-cream transition-colors hover:text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
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
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/5 bg-main transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="relative h-[300px] w-full overflow-hidden lg:h-[308px]">
          <GradientPanel tone={card.tone} interactive />
          <div className="relative flex h-full flex-col justify-between p-5">
            <span className="inline-flex w-fit items-center rounded-full bg-black/30 px-3 py-1 text-[13px] text-cream backdrop-blur-sm">
              {card.categoryLabel ?? 'Case Study'}
            </span>
            {(card.code || card.date) && (
              <div className="flex items-center justify-between text-[12px] text-cream/85">
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
          {card.excerpt && <p className="mt-3 line-clamp-2 text-[15px] leading-[1.5] text-body">{card.excerpt}</p>}
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[12px] text-body">
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
