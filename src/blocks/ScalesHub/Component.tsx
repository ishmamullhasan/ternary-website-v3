import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import ScaleFigure from '@/components/scales/ScaleFigure'
import RevealText from '@/components/text/RevealText'
import { cn } from '@/lib/utils'
import type { ScalesHubBlock } from '@/payload-types'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { JSX } from 'react'

/**
 * Scales hub (CMS build-out 2026-08-01). Ported verbatim from the previous hardcoded /scales page
 * into an editable block. Same contract as SolutionsHub: design in code, copy CMS-first with the
 * authored default below as fallback so a half-edited doc can never render broken. Design unchanged.
 *
 * Structure: hero + scale index → the three scales → the point → what moves / never moves →
 * the constant standard → closing CTA.
 */

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
  transition: { duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) },
})

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// ---------------------------------------------------------------------------------------------
// Authored defaults — the previous hardcoded content, verbatim.
// ---------------------------------------------------------------------------------------------
type Fact = { k: string; v: string; lead?: boolean }

const DEFAULT_SCALES = [
  {
    name: 'Startups & Scale-ups',
    title: 'Move fast without building your own mess.',
    lede: 'Founders and early tech leaders with more roadmap than people to build it.',
    facts: [
      {
        k: 'How we show up',
        v: 'One senior team, shipping every day — and you talk straight to the people writing the code.',
      },
      { k: 'Typical shape', v: 'Frame™ or Flow™ · 3–9 months · 3–6 engineers.' },
      {
        k: 'Week one',
        v: 'The key decisions are made. Your setup is running. The first working piece is in review.',
        lead: true,
      },
    ] as Fact[],
    proof: ['Alley Analytix', 'Turfly'],
  },
  {
    name: 'Mid-Market & Enterprise',
    title: 'Modernize without a hard stop.',
    lede: 'The leaders replacing a system the business cannot afford to switch off.',
    facts: [
      {
        k: 'How we show up',
        v: 'Long, multi-team programs — run with the oversight and reporting your board will expect.',
      },
      { k: 'Typical shape', v: 'Flow™ or Orchestra™ · 12+ months · several teams.' },
      {
        k: 'Week one',
        v: 'Where you stand today is mapped. The order of work is planned. Risks are named out loud.',
        lead: true,
      },
    ] as Fact[],
    proof: ['FAROGL', 'Hissho Sushi'],
  },
  {
    name: 'Government & Public Institutions',
    title: 'Public deadlines. Audits. No surprises.',
    lede: 'Agencies and public bodies where "trust us" is not an acceptable answer.',
    facts: [
      {
        k: 'How we show up',
        v: 'Security and a full record built in from day one — documented for the people who must review it, not just developers.',
      },
      { k: 'Typical shape', v: 'Frame™ · sized to your procurement process · scoped teams.' },
      {
        k: 'Week one',
        v: 'The rules you must follow are mapped before a single line of code.',
        lead: true,
      },
    ] as Fact[],
    proof: ['Dhaka Stock Exchange'],
  },
]

const DEFAULT_NEVER_MOVES = [
  'Who we hire',
  'How closely we check the work',
  'Our standard for finished work',
  'Senior people on the work',
]

const DEFAULT_SHAPED_TO_YOU = [
  'How much process and formality',
  'How often we report to you',
  'Team size and structure',
  'How much documentation',
]

const DEFAULT_CONSTANT = [
  {
    title: 'Who we hire holds',
    body: 'The same senior people, whether the work is a first-round startup or a long-term government program. No juniors quietly substituted in when the name on the door is smaller.',
  },
  {
    title: 'How we check the work holds',
    body: 'One standard for reviewing the code and one standard for calling it finished, applied the same way across New York and our Dhaka delivery hub.',
  },
  {
    title: 'The ownership holds',
    body: "We stay accountable past launch — monitoring, maintaining, and modernizing so today's build never becomes tomorrow's legacy.",
  },
]

export function ScalesHubComponent(cms: Partial<ScalesHubBlock> = {}): JSX.Element {
  const SCALES = cms.scales?.length
    ? cms.scales.map((s, i) => ({
        n: ['00', '01', '10'][i] ?? String(i),
        name: s.name ?? '',
        title: s.title ?? '',
        lede: s.lede ?? '',
        facts: (s.facts ?? []).map((f) => ({ k: f.k ?? '', v: f.v ?? '', lead: f.lead ?? false })) as Fact[],
        proof: (s.proof ?? []).map((p) => p.name ?? ''),
      }))
    : DEFAULT_SCALES.map((s, i) => ({ ...s, n: ['00', '01', '10'][i] ?? String(i) }))
  const NEVER_MOVES = cms.neverMoves?.length ? cms.neverMoves.map((x) => x.item ?? '') : DEFAULT_NEVER_MOVES
  const SHAPED_TO_YOU = cms.shapedToYou?.length ? cms.shapedToYou.map((x) => x.item ?? '') : DEFAULT_SHAPED_TO_YOU
  const CONSTANT = cms.constant?.length
    ? cms.constant.map((c) => ({ title: c.title ?? '', body: c.body ?? '' }))
    : DEFAULT_CONSTANT

  const heroHeading = cms.heroHeading || 'From founding teams to national institutions.'
  const heroSub =
    cms.heroSub ||
    'Our quality bar doesn’t change with your size. The shape of the engagement does — one engineering standard, held all the way up.'
  const pointLead = cms.pointLead || 'A startup and a stock exchange get'
  const pointLeadMuted = cms.pointLeadMuted || 'the same engineers.'
  const pointBody1 =
    cms.pointBody1 ||
    'They don’t get the same process, oversight, or reporting rhythm — those should differ. But who we hire, how closely we check the work, and the people in the room don’t change with the size of the bill.'
  const pointBody2Lead = cms.pointBody2Lead || 'And the scales aren’t sealed off from each other.'
  const pointBody2 =
    cms.pointBody2 ||
    'The startup we build for today becomes the enterprise program in three years — with the same people in the room who remember why every decision was made.'
  const movesHeading = cms.movesHeading || 'What moves with your size — and what never does'
  const constantHeading = cms.constantHeading || 'Whatever your size, the standard is the point.'
  const constantBlurb =
    cms.constantBlurb ||
    'The work changes shape as you grow — the standard does not. Every team, at every size, brings the same careful review and the same senior hands. A startup’s first product and a national program are built to the one bar.'
  const ctaHeading = cms.ctaHeading || 'Tell us where you are. We’ll show up shaped for it.'
  const ctaBody =
    cms.ctaBody ||
    'Describe the stage you’re at and the problem in front of you. We’ll bring the right shape of engagement — and hold the same bar all the way up.'

  return (
    <div className="w-full pb-[clamp(48px,5vw,80px)]">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(244,243,236,0.02) 0 1px, transparent 1px 120px)',
          }}
        />
        <div className="relative mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 pt-[clamp(32px,6vh,72px)] pb-[clamp(48px,7vh,80px)]">
          <Motion className="flex flex-col gap-7" {...reveal}>
            <h1 className="max-w-[18ch] font-display text-[clamp(2.75rem,7vw,6rem)] font-medium leading-[1.01] tracking-[-0.04em] text-cream">
              {heroHeading}
            </h1>
            <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">{heroSub}</p>
          </Motion>

          <Motion className="mt-14 flex flex-wrap gap-x-8 gap-y-3 pt-7 lg:mt-20" {...reveal}>
            {SCALES.map((s) => (
              <Link
                key={s.n}
                href={`#s${s.n}`}
                className={cn(
                  'group inline-flex items-center gap-2.5 rounded-sm text-[13px] tracking-[0.02em] text-subtle transition-colors duration-200 hover:text-cream',
                  FOCUS_RING,
                )}
              >
                {s.name}
              </Link>
            ))}
          </Motion>
        </div>
      </section>

      {/* ── THE THREE SCALES (centerpiece) ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)]">
        <div className="grid gap-4 lg:gap-5">
          {SCALES.map((s, i) => (
            <Motion key={s.n} {...revealItem(i)}>
              <div
                id={`s${s.n}`}
                className="sc-card sc-tile grid scroll-mt-28 grid-cols-1 gap-x-8 gap-y-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,1fr)_21rem_minmax(0,1fr)] lg:p-12"
              >
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-body">{s.name}</span>
                  <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                    {s.title}
                  </h2>
                  <p className="mt-6 max-w-[46ch] text-[clamp(1rem,1.5vw,1.1875rem)] leading-relaxed text-body">
                    {s.lede}
                  </p>
                </div>

                <div className="sc-figure-xl hidden lg:flex lg:items-center lg:justify-center" aria-hidden="true">
                  <div className="w-full max-w-[330px]">
                    <ScaleFigure title={s.name} index={i} />
                  </div>
                </div>

                <div className="flex flex-col gap-6 pt-2 lg:pt-1">
                  <dl className="flex flex-col gap-6">
                    {s.facts.map((f) => (
                      <div
                        key={f.k}
                        className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-x-7"
                      >
                        <dt className="text-[11px] uppercase tracking-[0.1em] text-subtle">{f.k}</dt>
                        <dd className={cn('text-[15px] leading-relaxed', f.lead ? 'font-medium text-cream' : 'text-body')}>
                          {f.v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {s.proof.length > 0 && (
                    <p className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-2 text-[12px] tracking-[0.04em] text-subtle">
                      <span className="uppercase tracking-[0.12em] text-cream/70">Recently at this scale</span>
                      <span>{s.proof.join(' · ')}</span>
                    </p>
                  )}
                </div>
              </div>
            </Motion>
          ))}
        </div>
      </section>

      {/* ── THE POINT ────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)] lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <RevealText
            className="max-w-[20ch] font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-medium leading-[1.18] tracking-[-0.02em] text-cream"
            segments={[{ text: pointLead }, { text: pointLeadMuted, className: 'text-body' }]}
          />
          <Motion className="flex flex-col gap-5 lg:text-right" {...reveal}>
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-body">{pointBody1}</p>
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-body">
              <span className="font-medium text-cream">{pointBody2Lead}</span> {pointBody2}
            </p>
          </Motion>
        </div>
      </section>

      {/* ── WHAT MOVES / WHAT NEVER DOES ─────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)]">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <Motion className="flex flex-col gap-4" {...reveal}>
              <h2 className="max-w-[18ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                {movesHeading}
              </h2>
            </Motion>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Motion className="h-full" {...revealItem(0)}>
                <div className="sc-tile flex h-full flex-col rounded-xl p-8">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-cream/70">Never moves</span>
                  <p className="mt-2 text-[13px] text-subtle">Constant at every scale.</p>
                  <ul className="mt-6 flex flex-col gap-1">
                    {NEVER_MOVES.map((item) => (
                      <li key={item} className="flex items-baseline gap-3 py-2 text-[15px] text-cream">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-sm bg-cream/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Motion>

              <Motion className="h-full" {...revealItem(1)}>
                <div className="sc-tile flex h-full flex-col rounded-xl p-8">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-subtle">Shaped to you</span>
                  <p className="mt-2 text-[13px] text-subtle">Fitted to your size and stakes.</p>
                  <ul className="mt-6 flex flex-col gap-1">
                    {SHAPED_TO_YOU.map((item) => (
                      <li key={item} className="flex items-baseline gap-3 py-2 text-[15px] text-body">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-sm bg-subtle" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Motion>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE CONSTANT ─────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-[clamp(48px,5vw,80px)]">
          <Motion
            className="mb-[clamp(28px,4vw,56px)] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
            {...reveal}
          >
            <h2 className="max-w-[24ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
              {constantHeading}
            </h2>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body lg:pt-1 lg:text-right">{constantBlurb}</p>
          </Motion>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONSTANT.map((s, i) => (
              <Motion key={s.title} className="sc-tile flex flex-col gap-2 rounded-xl p-6" {...revealItem(i)}>
                <h3 className="text-[18px] font-medium tracking-[-0.01em] text-cream">{s.title}</h3>
                <p className="max-w-[48ch] text-[15px] leading-relaxed text-body">{s.body}</p>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (signature noise-gradient moment) ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12">
        <Motion tag="div" className="sc-tile relative overflow-hidden p-10 lg:p-16" {...reveal}>
          <span aria-hidden className="absolute inset-0">
            <span
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(130% 130% at 20% 15%, #2a2452 0%, #16132f 48%, #0b0a17 100%)',
              }}
            />
            <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
            <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/40" />
          </span>

          <div className="relative z-10 flex flex-col gap-6">
            <h2 className="max-w-[18ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-cream">
              {ctaHeading}
            </h2>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-body">{ctaBody}</p>
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
                href="/work"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.06] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-white/[0.12]',
                  FOCUS_RING,
                )}
              >
                See our work
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </Motion>
      </section>
    </div>
  )
}
