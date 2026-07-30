import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { RelatedWorkSection } from '@/components/relatedWork'
import { asTypedLocale, LOCALES } from '@/lib/i18n/locales'
import { generateMeta } from '@/lib/seo/generateMeta'
import type { Capability, Solution, Story } from '@/payload-types'
import config from '@/payload.config'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX } from 'react'

// SSG + ISR: prebuild known slugs (generateStaticParams below) and serve them statically.
// Freshness is purely tag-driven (no time-based revalidate) — the solution afterChange/afterDelete
// hooks bust the tags below. dynamicParams lets slugs not in the prebuilt set render on demand.
export const dynamicParams = true

const getSolutionList = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'solution',
      limit: 100,
      depth: 0,
    })
    return result.docs
  },
  ['solution'],
  { tags: ['solution'] },
)

async function fetchSolutionBySlug(slug: string, locale: TypedLocale): Promise<Solution | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'solution',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Solution | undefined) ?? null
}

// Tag-based ISR (WEB-457): published reads are cached and busted on-demand by the
// `revalidateTag('solution')` / `revalidateTag('solution_<slug>')` calls in the solution
// afterChange hook (makeContentCollection). In draft mode (live preview) we bypass the cache
// so editors see fresh data.
// _v6: Stage 8 rebuilt the template around the new `detail` group (seeded by direct DB write, so
// no tag revalidation fired) — the bump busts the persisted _v5 entries on deploy.
async function getSolutionBySlug(slug: string, locale: TypedLocale): Promise<Solution | null> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return fetchSolutionBySlug(slug, locale)
  return unstable_cache(() => fetchSolutionBySlug(slug, locale), [`solution_${slug}_${locale}_v6`], {
    tags: [`solution_${slug}`, 'solution'],
  })()
}

export async function generateStaticParams() {
  const solutions = await getSolutionList()
  // Cross-product: one entry per {locale, slug}.
  return LOCALES.flatMap((locale) => solutions.map((solution) => ({ locale, slug: solution.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) return {}
  const solution = await getSolutionBySlug(slug, typedLocale)

  if (!solution) return {}

  return generateMeta({
    doc: solution,
    fallbackTitle: 'Solution',
    fallbackDescription: solution.detail?.defn || solution.excerpts,
    pathname: `/solutions/${slug}`,
    locale: typedLocale,
    ogType: 'article',
  })
}

// ---------------------------------------------------------------------------------------------
// Presentation — the Stage 8 seven-section template, entirely from the doc's `detail` group:
// 01 hero (breadcrumb → eyebrow → h1 → definition → intro → meta row) · 02 position (pull-quote +
// two paragraphs) · 03 how it runs (numbered phases + amber "In plain terms" callout) · 04 what
// you walk away with · 05 proof (linked case cards and/or an honest note) · 06 capabilities this
// draws on · 07 CTA. Every section is guarded on its data, so a sparse doc degrades to hero + CTA
// without empty shells. No sentence of the old generic template survives (plan rule) — the old
// hardcoded RELATED_WORK slug map (which still carried flex5 as proof) is replaced by the doc's
// own `detail.proof` relationship.
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
  transition: { duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.42) },
})

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// Canonical hub order — drives the "Solution · N of 4" eyebrow.
const SOLUTION_ORDER = ['product-development', 'enterprise-transformation', 'engineering-augmentation', 'managed-systems']

/** Render a pull-quote string whose *starred* span is emphasised (brighter, per the plan's italics). */
function Pull({ text }: { text: string }): JSX.Element {
  const parts = text.split('*')
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className="text-cream">
            {part}
          </em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<JSX.Element> {
  const { locale, slug } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()
  const solution = await getSolutionBySlug(slug, typedLocale)
  if (!solution) notFound()

  const d = solution.detail
  const order = SOLUTION_ORDER.indexOf(slug)
  const eyebrow = order >= 0 ? `Solution · ${order + 1} of ${SOLUTION_ORDER.length}` : 'Solution'
  const capabilities = (d?.drawsOn ?? []).filter((c): c is Capability => typeof c === 'object' && c !== null)
  const proofStories = (d?.proof ?? []).filter((s): s is Story => typeof s === 'object' && s !== null)
  const phases = d?.phases ?? []
  const walkAway = d?.walkAway ?? []

  return (
    <div className="mx-auto w-full max-w-[1480px] px-5 pb-[clamp(48px,5vw,80px)] md:px-8 lg:px-12">
      {/* ── 01 · hero ─────────────────────────────────────────────────────────────────────── */}
      <section className="pt-[clamp(24px,5vh,56px)]">
        <Motion
          tag="div"
          className="flex flex-col items-start gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[12px] tracking-normal text-subtle">
            <Link href="/solutions" className={`transition-colors hover:text-cream ${FOCUS_RING}`}>
              Solutions
            </Link>
            <span aria-hidden>/</span>
            <span className="text-body">{solution.title}</span>
          </nav>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{eyebrow}</span>
          <h1 className="max-w-[16ch] font-display text-[clamp(2.25rem,5.5vw,4.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-cream">
            {d?.h1 || solution.title}
          </h1>
          {d?.defn && <p className="max-w-2xl text-[clamp(1.1rem,1.8vw,1.4rem)] leading-snug text-cream/90">{d.defn}</p>}
          {d?.intro && <p className="max-w-2xl text-base leading-relaxed text-body">{d.intro}</p>}
        </Motion>

        {(d?.metaModels || d?.metaShape || capabilities.length > 0) && (
          <Motion tag="dl" {...reveal} className="mt-12 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {d?.metaModels && (
              <div className="flex flex-col gap-2">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">Engagement models</dt>
                <dd className="text-base text-cream">{d.metaModels}</dd>
              </div>
            )}
            {d?.metaShape && (
              <div className="flex flex-col gap-2">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">Typical shape</dt>
                <dd className="text-base text-cream">{d.metaShape}</dd>
              </div>
            )}
            {capabilities.length > 0 && (
              <div className="flex flex-col gap-2">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">Draws on</dt>
                <dd className="flex flex-wrap gap-x-3 gap-y-1">
                  {capabilities.map((cap) => (
                    <Link
                      key={cap.id}
                      href={`/capabilities/${cap.slug}`}
                      className={`text-base text-cream underline-offset-4 transition-colors hover:underline ${FOCUS_RING}`}
                    >
                      {cap.title}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
          </Motion>
        )}
      </section>

      {/* ── 02 · position ─────────────────────────────────────────────────────────────────── */}
      {(d?.pull || d?.positionA || d?.positionB) && (
        <section className="mt-24 grid grid-cols-1 gap-10 border-t border-line pt-16 lg:mt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
          {d?.pull && (
            <Motion
              tag="blockquote"
              {...reveal}
              className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium not-italic leading-[1.2] tracking-[-0.02em] text-body"
            >
              <Pull text={d.pull} />
            </Motion>
          )}
          <Motion tag="div" {...reveal} className="flex flex-col gap-6">
            {d?.positionA && <p className="text-base leading-relaxed text-body lg:text-lg">{d.positionA}</p>}
            {d?.positionB && <p className="text-base leading-relaxed text-body lg:text-lg">{d.positionB}</p>}
          </Motion>
        </section>
      )}

      {/* ── 03 · how it runs ──────────────────────────────────────────────────────────────── */}
      {phases.length > 0 && (
        <section className="mt-24 border-t border-line pt-16 lg:mt-32">
          <Motion tag="h2" {...reveal} className="text-section font-display font-medium text-cream">
            How it runs
          </Motion>
          <div className="mt-10 flex flex-col">
            {phases.map((phase, i) => (
              <Motion
                key={phase.id ?? i}
                tag="div"
                {...revealItem(i)}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1 border-t border-line/60 py-6 first:border-t-0 lg:grid-cols-[80px_minmax(0,0.6fr)_minmax(0,1.4fr)] lg:items-baseline"
              >
                <span className="font-mono text-[13px] tabular-nums text-subtle">{i + 1}</span>
                <h3 className="font-display text-lg font-medium text-cream">{phase.title}</h3>
                {phase.body && <p className="col-span-2 text-base leading-relaxed text-body lg:col-span-1">{phase.body}</p>}
              </Motion>
            ))}
          </div>
          {d?.plainTerms && (
            <Motion tag="aside" {...reveal} className="mt-10 rounded-md border border-amber-400/30 bg-amber-500/[0.07] p-6 lg:p-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber-200/90">In plain terms</span>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-cream/90">{d.plainTerms}</p>
            </Motion>
          )}
        </section>
      )}

      {/* ── 04 · what you walk away with ──────────────────────────────────────────────────── */}
      {walkAway.length > 0 && (
        <section className="mt-24 border-t border-line pt-16 lg:mt-32">
          <Motion tag="h2" {...reveal} className="text-section font-display font-medium text-cream">
            What you walk away with
          </Motion>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {walkAway.map((item, i) => (
              <Motion
                key={item.id ?? i}
                tag="div"
                {...revealItem(i)}
                className="flex flex-col gap-2 rounded-md border border-white/[0.06] bg-ink p-6 lg:p-8"
              >
                <h3 className="font-display text-lg font-medium text-cream">{item.title}</h3>
                {item.body && <p className="text-base leading-relaxed text-body">{item.body}</p>}
              </Motion>
            ))}
          </div>
        </section>
      )}

      {/* ── 05 · proof ────────────────────────────────────────────────────────────────────── */}
      {(proofStories.length > 0 || d?.proofNote) && (
        <section className="mt-24 border-t border-line pt-4 lg:mt-32">
          <RelatedWorkSection stories={proofStories} locale={typedLocale} sectionIndex={5} heading="Proof" />
          {d?.proofNote && (
            <Motion tag="p" {...reveal} className="mt-6 max-w-2xl text-base leading-relaxed text-subtle">
              {d.proofNote}
            </Motion>
          )}
        </section>
      )}

      {/* ── 06 · capabilities this draws on ───────────────────────────────────────────────── */}
      {capabilities.length > 0 && (
        <section className="mt-24 border-t border-line pt-16 lg:mt-32">
          <Motion tag="h2" {...reveal} className="text-section font-display font-medium text-cream">
            Capabilities this draws on
          </Motion>
          <div className="mt-8 flex flex-col">
            {capabilities.map((cap, i) => (
              <Motion key={cap.id} tag="div" {...revealItem(i)}>
                <Link
                  href={`/capabilities/${cap.slug}`}
                  className={`group flex items-center justify-between gap-4 border-t border-line/60 py-5 transition-colors first:border-t-0 hover:text-cream ${FOCUS_RING}`}
                >
                  <span className="font-display text-lg font-medium text-cream">{cap.title}</span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden
                    className="shrink-0 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cream"
                  />
                </Link>
              </Motion>
            ))}
          </div>
        </section>
      )}

      {/* ── 07 · CTA ──────────────────────────────────────────────────────────────────────── */}
      <Motion
        tag="section"
        {...reveal}
        className="relative mt-24 overflow-hidden rounded-md border border-white/[0.06] p-8 lg:mt-32 lg:p-14"
        style={{ background: 'radial-gradient(135% 135% at 18% 12%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)' }}
      >
        <div className="relative flex flex-col items-start gap-5">
          <h2 className="max-w-[24ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.15] text-cream">
            {d?.ctaHeading || 'Start a conversation.'}
          </h2>
          {d?.ctaLine && <p className="max-w-2xl text-base leading-relaxed text-cream/85">{d.ctaLine}</p>}
          <Link
            href="/contact"
            className={`group mt-2 inline-flex items-center gap-2 rounded-md bg-cream px-6 py-3 text-sm font-medium text-page transition-colors hover:bg-cream-hover ${FOCUS_RING}`}
          >
            Start a conversation
            <ArrowRight size={16} aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Motion>
    </div>
  )
}
