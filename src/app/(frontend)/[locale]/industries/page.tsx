import Motion from '@/components/animation/motion'
import IndustryGlyph, { industryGlyphVariant } from '@/components/industry/IndustryGlyph'
import Link from '@/components/LocalizedLink'
import { asTypedLocale } from '@/lib/i18n/locales'
import { isExcludedIndustry } from '@/lib/industryHubExclusions'
import { cn } from '@/lib/utils'
import type { Industry } from '@/payload-types'
import config from '@/payload.config'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import type { TypedLocale } from 'payload'
import { getPayload } from 'payload'
import type { JSX, ReactNode } from 'react'

import './industriesHub.css'

// Tag-based ISR: the `industry` afterChange/afterDelete hooks bust the `industry` tag, so this
// index refreshes on publish without a time-based revalidate.
async function getIndustries(locale: TypedLocale): Promise<Industry[]> {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({ collection: 'industry', locale, limit: 100, depth: 0 })
      return result.docs as Industry[]
    },
    [`industry_hub_${locale}`],
    { tags: ['industry'] },
  )()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!asTypedLocale(locale)) return {}
  return {
    title: 'Industries — Ternary',
    description:
      'Eight sectors where the rules, the risk, and the vocabulary are specific — and generic software doesn’t survive contact.',
  }
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' } as const,
  transition: { duration: 0.6, ease: EASE },
}

const revealItem = (index: number) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) },
})

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// Uppercase micro-label with a leading cream hairline. Mono intent is carried by Inter with
// tracking + tabular figures (repo has no Geist Mono — see redesign/v2 notes).
function Eyebrow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-subtle">
      <span aria-hidden className="h-px w-6 bg-cream/50" />
      {children}
    </span>
  )
}

// --- Static content (voice preserved verbatim from the draft; hardcoded — no CMS global fits). ---
const APPROACH = [
  {
    n: '1',
    title: 'Learn the rules',
    body: 'Regulation, workflows, vocabulary. We study how your world actually runs before proposing how software should.',
  },
  {
    n: '2',
    title: 'Sit with the operators',
    body: 'The people doing the work every day know exactly where it breaks. We build from beside them, not from a spec.',
  },
  {
    n: '3',
    title: 'Build to the constraints',
    body: 'Compliance, uptime windows, audit trails — treated as first-class requirements from day one, not patched in later.',
  },
] as const

const POSTURE = [
  {
    n: 'a',
    title: 'Traceable by default',
    body: 'Every consequential action is attributable and replayable.',
  },
  {
    n: 'b',
    title: 'Deployed inside the boundary',
    body: 'On-premises and air-gapped patterns where the data can’t leave the building.',
  },
  {
    n: 'c',
    title: 'Documented for procurement',
    body: 'Architecture, controls, and evidence packaged the way review boards actually ask for them.',
  },
] as const

// Ambient hero lattice — decorative, neutral, low-contrast. Drifts slowly; stilled by reduced-motion.
function AmbientField(): JSX.Element {
  const cols = [120, 260, 400, 540, 680, 820]
  const rows = [60, 150, 240, 330]
  return (
    <div className="ih-ambient" aria-hidden>
      <svg viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="ih-drift" stroke="#f4f3ec" strokeOpacity="0.05" strokeWidth="1">
          {cols.map((x) => (
            <line key={`c${x}`} x1={x} y1="20" x2={x} y2="360" />
          ))}
          {rows.map((y) => (
            <line key={`r${y}`} x1="80" y1={y} x2="860" y2={y} />
          ))}
        </g>
        <g fill="#f4f3ec" fillOpacity="0.28">
          {cols.slice(1, 5).map((x, i) => (
            <circle key={`n${x}`} cx={x} cy={rows[i % rows.length]} r="1.6" />
          ))}
        </g>
        <circle className="ih-pulse" cx="540" cy="150" r="2.6" fill="#f4f3ec" fillOpacity="0.5" />
      </svg>
    </div>
  )
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }): Promise<JSX.Element> {
  const { locale } = await params
  const typedLocale = asTypedLocale(locale)
  if (!typedLocale) notFound()

  const all = await getIndustries(typedLocale)
  // CMS-driven list: published industry docs, minus the hub exclusions (Software Platforms, Test
  // Industry). Order follows the collection's default (createdAt) — a CMS `order` field is a
  // possible follow-up if manual ordering is wanted.
  const industries = all.filter((doc) => Boolean(doc.title) && !isExcludedIndustry(doc.title))

  return (
    <div className="w-full pb-24 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line/60">
        <AmbientField />
        <div className="relative mx-auto w-full max-w-[1480px] px-5 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <Motion className="flex flex-col gap-6" {...reveal}>
            <Eyebrow>Industries</Eyebrow>
            <h1 className="max-w-[16ch] font-display text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[1.04] tracking-[-0.03em] text-cream">
              We build where the stakes are specific.
            </h1>
            <p className="max-w-[54ch] text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-body">
              Every sector has its own rules, risks, and vocabulary. We learn yours before we build — because generic
              software doesn’t survive contact.
            </p>
          </Motion>
        </div>
      </section>

      {/* ── THE SECTORS (CMS-driven) ─────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 py-24 lg:py-32">
        <Motion className="mb-12 flex flex-col gap-4 lg:mb-16" {...reveal}>
          <Eyebrow>The sectors</Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.03em] text-cream">
              Where we build
            </h2>
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-body">
              Each entry opens into the work behind it. Where a client can be named, they are.
            </p>
          </div>
        </Motion>

        {industries.length > 0 ? (
          <div className="border-b border-line">
            {industries.map((industry, index) => (
              <Motion key={industry.id} {...revealItem(index)}>
                <Link
                  href={`/${typedLocale}/industries/${industry.slug}`}
                  className={cn(
                    'group grid grid-cols-[2.5rem_1fr] items-start gap-x-5 gap-y-2 border-t border-line py-8 transition-colors duration-300 hover:bg-gradient-to-r hover:from-white/[0.03] hover:to-transparent lg:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.35fr)_3.5rem_2.5rem] lg:items-center lg:gap-x-8 lg:py-10',
                    FOCUS_RING,
                  )}
                >
                  <span className="pt-1 font-display text-[13px] tabular-nums text-subtle transition-colors duration-300 group-hover:text-cream lg:pt-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-[clamp(1.25rem,2.2vw,1.625rem)] font-medium leading-[1.15] tracking-[-0.02em] text-cream">
                    {industry.title}
                  </h3>
                  {industry.excerpts ? (
                    <p className="col-span-2 max-w-[52ch] text-[15px] leading-relaxed text-body lg:col-span-1 lg:col-start-3">
                      {industry.excerpts}
                    </p>
                  ) : (
                    <span className="hidden lg:block" />
                  )}
                  <span
                    aria-hidden
                    className="hidden text-subtle transition-colors duration-300 group-hover:text-cream lg:col-start-4 lg:row-start-1 lg:block lg:size-12 lg:justify-self-center"
                  >
                    <IndustryGlyph variant={industryGlyphVariant(industry.slug ?? industry.title)} />
                  </span>
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden
                    className="col-start-2 row-start-1 hidden justify-self-end text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream lg:col-start-5 lg:block"
                  />
                </Link>
              </Motion>
            ))}
          </div>
        ) : (
          <p className="border-t border-line py-10 text-[15px] text-subtle">No industries published yet.</p>
        )}
      </section>

      {/* ── HOW WE ENTER A SECTOR ────────────────────────────────────────────────────── */}
      <section className="border-t border-line/60">
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:py-32">
          <Motion className="flex flex-col gap-4" {...reveal}>
            <Eyebrow>Our approach</Eyebrow>
            <h2 className="max-w-[14ch] font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.03em] text-cream">
              Before we write a line of code
            </h2>
          </Motion>
          <div className="flex flex-col border-b border-line">
            {APPROACH.map((step, index) => (
              <Motion key={step.n} className="flex flex-col gap-2 border-t border-line py-7" {...revealItem(index)}>
                <h3 className="flex items-baseline gap-3.5 text-[18px] font-medium tracking-[-0.01em] text-cream">
                  <span className="font-display text-[13px] tabular-nums text-cream/50">{step.n}.</span>
                  {step.title}
                </h3>
                <p className="max-w-[48ch] pl-[26px] text-[15px] leading-relaxed text-body">{step.body}</p>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILT TO BE AUDITED ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line/60">
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:py-32">
          <Motion className="flex flex-col gap-4" {...reveal}>
            <Eyebrow>Regulatory posture</Eyebrow>
            <h2 className="max-w-[12ch] font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium leading-[1.08] tracking-[-0.03em] text-cream">
              Built to be audited
            </h2>
          </Motion>
          <div className="flex flex-col border-b border-line">
            {POSTURE.map((point, index) => (
              <Motion key={point.n} className="flex flex-col gap-2 border-t border-line py-7" {...revealItem(index)}>
                <h3 className="flex items-baseline gap-3.5 text-[18px] font-medium tracking-[-0.01em] text-cream">
                  <span className="font-display text-[13px] tabular-nums text-cream/50">{point.n}.</span>
                  {point.title}
                </h3>
                <p className="max-w-[48ch] pl-[26px] text-[15px] leading-relaxed text-body">{point.body}</p>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5">
        <Motion
          tag="div"
          className="relative overflow-hidden rounded-md border border-white/[0.06] p-10 lg:p-16"
          {...reveal}
        >
          <span aria-hidden className="absolute inset-0">
            <span
              className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(130% 130% at 18% 12%, #1c1b18 0%, #121110 48%, #0b0a09 100%)' }}
            />
            <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.14] mix-blend-overlay" />
          </span>
          <div className="relative z-10 flex flex-col gap-6">
            <Eyebrow>Start here</Eyebrow>
            <h2 className="max-w-[18ch] font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
              Don’t see your industry?
            </h2>
            <p className="max-w-[54ch] text-[16px] leading-relaxed text-body">
              The list above grows with the work. If your world has its own rules and real stakes, we’re interested —
              and your first conversation is with someone who’s built in a sector like yours, not a generalist.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md bg-cream px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover',
                  FOCUS_RING,
                )}
              >
                Start a conversation
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </Link>
              <Link
                href="/case-studies"
                className={cn(
                  'inline-flex items-center justify-center rounded-md border border-white/20 bg-white/[0.06] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-white/[0.12]',
                  FOCUS_RING,
                )}
              >
                See our work
              </Link>
            </div>
          </div>
        </Motion>
      </section>
    </div>
  )
}
