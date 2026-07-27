import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import ScaleFigure from '@/components/scales/ScaleFigure'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'

/**
 * Scales — landing redesign, ported from public/hub/scales-hub-ternary.html into Ternary's own
 * design language to match /capabilities-hub: monochrome cream-on-near-black (no amber/tan), the
 * Poppins display + Inter body pairing, brand tokens (page/ink/line/subtle/body), tabular numerals
 * in place of a mono face, the shared Motion scroll-reveal, and one signature noise-gradient CTA.
 *
 * Content is faithful to the mockup — the three scales (Startups & Scale-ups, Mid-Market &
 * Enterprise, Government & Public Institutions), each with "how we show up / typical shape / week
 * one" facts and recent proof; the "same engineers" point; the moves/never-moves split; and the
 * closing CTA. The interactive canvas panels and JS router become static, self-contained markup —
 * a server component, no separate .css file.
 *
 * Structure: hero + scale index → the three scales → the point → what moves / what never does →
 * the constant standard → closing CTA. Scales are numbered in base three, in keeping with the name.
 */

export const metadata: Metadata = {
  title: 'Scales — From founding teams to national institutions.',
  description:
    "Our quality bar doesn't change with your size — the shape of the engagement does. One engineering standard, held from a startup's first MVP to a national institution.",
}

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
// Content — the three scales, base-three numbered. The engagement changes shape; the bar does not.
// ---------------------------------------------------------------------------------------------
type Fact = { k: string; v: string; lead?: boolean }

const SCALES = [
  {
    n: '00',
    mark: 'Scale 1 of 3',
    name: 'Startups & Scale-ups',
    title: 'Move fast without building your own mess.',
    lede: 'Founders and early CTOs with more roadmap than team.',
    facts: [
      {
        k: 'How we show up',
        v: 'One senior pod, shipping daily, with direct access to the people writing the code.',
      },
      { k: 'Typical shape', v: 'Frame™ or Flow™ · 3–9 months · 3–6 engineers.' },
      {
        k: 'Week one',
        v: 'Architecture decided. Environments live. First increment in review.',
        lead: true,
      },
    ] as Fact[],
    proof: ['Alley Analytix', 'Flex5 by Reality Meets Science'],
  },
  {
    n: '01',
    mark: 'Scale 2 of 3',
    name: 'Mid-Market & Enterprise',
    title: 'Modernize without a hard stop.',
    lede: "CTOs and transformation leads replacing something that can't afford to pause.",
    facts: [
      {
        k: 'How we show up',
        v: 'Multi-quarter programs, coordinated workstreams, governance your board will recognize.',
      },
      { k: 'Typical shape', v: 'Flow™ or Orchestra™ · 12+ months · multiple pods.' },
      {
        k: 'Week one',
        v: 'Current state mapped. Sequencing drafted. Risks named out loud.',
        lead: true,
      },
    ] as Fact[],
    proof: ['FAROGL', 'Hissho Sushi'],
  },
  {
    n: '10',
    mark: 'Scale 3 of 3',
    name: 'Government & Public Institutions',
    title: 'Mission timelines. Audit obligations. No surprises.',
    lede: 'Agencies and public bodies where "trust us" is not an acceptable answer.',
    facts: [
      {
        k: 'How we show up',
        v: 'Security and auditability designed in from day one. Documentation built for review boards, not just developers.',
      },
      { k: 'Typical shape', v: 'Frame™ · procurement-dependent · scoped teams.' },
      {
        k: 'Week one',
        v: 'Compliance requirements mapped before a single line of code.',
        lead: true,
      },
    ] as Fact[],
    proof: ['Dhaka Stock Exchange'],
  },
] as const

// What moves with your size — and what never does.
const NEVER_MOVES = [
  'The hiring bar',
  'The code review standard',
  'The definition of done',
  'Senior people on the work',
] as const

const SHAPED_TO_YOU = [
  'Process weight and ceremony',
  'Governance and reporting cadence',
  'Team size and structure',
  'Documentation depth',
] as const

// Eyebrow — hairline rule + uppercase micro-label, in the reference's design language.
function Eyebrow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em] text-subtle">
      <span aria-hidden className="h-px w-6 bg-cream/60" />
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------------------------
export default function ScalesHubPage(): JSX.Element {
  return (
    <div className="w-full pb-24 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* faint vertical rule field — quiet engineering texture */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(244,243,236,0.02) 0 1px, transparent 1px 120px)',
          }}
        />
        <div className="relative mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <Motion className="flex flex-col gap-7" {...reveal}>
            <Eyebrow>Scales · 00–10 · base 3</Eyebrow>
            <h1 className="max-w-[18ch] font-display text-[clamp(2.75rem,7vw,6rem)] font-medium leading-[1.01] tracking-[-0.04em] text-cream">
              From founding teams to national institutions.
            </h1>
            <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">
              Our quality bar doesn&apos;t change with your size. The shape of the engagement does — one engineering
              standard, held all the way up.
            </p>
          </Motion>

          {/* hero index — jump links to the three scales below */}
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
                <span className="font-mono tabular-nums text-cream/45 transition-colors duration-200 group-hover:text-cream">
                  {s.n}
                </span>
                {s.name}
              </Link>
            ))}
          </Motion>
        </div>
      </section>

      {/* ── THE THREE SCALES (centerpiece) ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12">
        <div className="grid gap-4 lg:gap-5">
          {SCALES.map((s, i) => (
            <Motion key={s.n} {...revealItem(i)}>
              <div
                id={`s${s.n}`}
                className="sc-card sc-tile grid scroll-mt-28 grid-cols-1 gap-x-8 gap-y-8 p-7 sm:p-9 lg:grid-cols-[11rem_minmax(0,1.1fr)_minmax(0,1fr)] lg:p-12"
              >
                <div className="flex flex-col gap-7">
                  <span className="font-display text-[15px] font-mono tabular-nums text-subtle">{s.n}</span>
                  {/* the same figure this scale carries on the home page, so both tell one story */}
                  <div className="hidden lg:block" aria-hidden="true">
                    <ScaleFigure title={s.name} index={i} />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-subtle">
                    {s.mark} · <span className="text-body">{s.name}</span>
                  </span>
                  <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                    {s.title}
                  </h2>
                  <p className="mt-6 max-w-[46ch] text-[clamp(1rem,1.5vw,1.1875rem)] leading-relaxed text-body">
                    {s.lede}
                  </p>
                  <p className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] tracking-[0.04em] text-subtle">
                    <span className="uppercase tracking-[0.12em] text-cream/70">Recently at this scale</span>
                    <span>{s.proof.join(' · ')}</span>
                  </p>
                </div>

                <dl className="flex flex-col gap-6 pt-2 lg:pt-1">
                  {s.facts.map((f) => (
                    <div
                      key={f.k}
                      className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-x-7"
                    >
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-subtle">{f.k}</dt>
                      <dd
                        className={cn('text-[15px] leading-relaxed', f.lead ? 'font-medium text-cream' : 'text-body')}
                      >
                        {f.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Motion>
          ))}
        </div>
      </section>

      {/* ── THE POINT ────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-10 px-5 md:px-8 lg:px-12 py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-32">
          <Motion {...reveal}>
            <p className="max-w-[16ch] font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-medium leading-[1.18] tracking-[-0.02em] text-cream">
              A startup and a stock exchange get <span className="text-body">the same engineers.</span>
            </p>
          </Motion>
          <Motion className="flex flex-col gap-5 self-end" {...reveal}>
            <p className="max-w-[56ch] text-[16px] leading-relaxed text-body">
              They don&apos;t get the same process, governance, or reporting cadence — those should differ. But the
              hiring bar, the review standard, and the people in the room don&apos;t move with the size of the invoice.
            </p>
            <p className="max-w-[56ch] text-[16px] leading-relaxed text-body">
              <span className="font-medium text-cream">And scales aren&apos;t silos.</span> The startup we build for
              today becomes the enterprise program in three years — with the same people in the room who remember why
              every decision was made.
            </p>
          </Motion>
        </div>
      </section>

      {/* ── WHAT MOVES / WHAT NEVER DOES ─────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-24 lg:py-32">
          <Motion className="mb-14 flex flex-col gap-4 lg:mb-20" {...reveal}>
            <Eyebrow>In practice</Eyebrow>
            <h2 className="max-w-[24ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
              What moves with your size — and what never does
            </h2>
          </Motion>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Motion className="h-full" {...revealItem(0)}>
              <div className="sc-tile flex h-full flex-col rounded-xl p-8">
                <span className="text-[11px] uppercase tracking-[0.12em] text-cream/70">Never moves</span>
                <p className="mt-2 text-[13px] text-subtle">Constant at every scale.</p>
                <ul className="mt-6 flex flex-col gap-1">
                  {NEVER_MOVES.map((item) => (
                    <li
                      key={item}
                      className="flex items-baseline gap-3 py-2 text-[15px] text-cream"
                    >
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
                    <li
                      key={item}
                      className="flex items-baseline gap-3 py-2 text-[15px] text-body"
                    >
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-sm bg-subtle" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Motion>
          </div>
        </div>
      </section>

      {/* ── THE CONSTANT ─────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-12 px-5 md:px-8 lg:px-12 py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20 lg:py-32">
          <Motion className="flex flex-col gap-6" {...reveal}>
            <Eyebrow>The constant</Eyebrow>
            <h2 className="max-w-[16ch] font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
              Whatever your size, the standard is the point.
            </h2>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
              The engagement changes shape as you grow — the standard does not. Every pod, at every scale, draws on the
              same review discipline and the same senior hands. A startup MVP and a national program are built to the
              one bar.
            </p>
          </Motion>

          <div className="grid gap-3">
            {[
              {
                k: 'a',
                title: 'The hiring bar holds',
                body: 'The same senior people, whether the invoice is a seed round or a program of record. No junior bench swapped in when the logo gets smaller.',
              },
              {
                k: 'b',
                title: 'The review standard holds',
                body: 'One code review bar and one definition of done, applied consistently across New York and the Dhaka delivery hub.',
              },
              {
                k: 'c',
                title: 'The ownership holds',
                body: "We stay accountable past launch — monitoring, maintaining, and modernizing so today's build never becomes tomorrow's legacy.",
              },
            ].map((s, i) => (
              <Motion key={s.k} className="sc-tile flex flex-col gap-2 rounded-xl p-6" {...revealItem(i)}>
                <h3 className="flex items-baseline gap-3.5 text-[18px] font-medium tracking-[-0.01em] text-cream">
                  <span className="font-display text-[13px] font-mono tabular-nums text-cream/50">{s.k}.</span>
                  {s.title}
                </h3>
                <p className="max-w-[48ch] pl-[26px] text-[15px] leading-relaxed text-body">{s.body}</p>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (signature noise-gradient moment) ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 pt-24 lg:pt-32">
        <Motion
          tag="div"
          className="sc-tile relative overflow-hidden p-10 lg:p-16"
          {...reveal}
        >
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
            <Eyebrow>Start here</Eyebrow>
            <h2 className="max-w-[18ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-cream">
              Tell us where you are. We&apos;ll show up shaped for it.
            </h2>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-body">
              Describe the stage you&apos;re at and the problem in front of you. We&apos;ll bring the right shape of
              engagement — and hold the same bar all the way up.
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
                href="/stories"
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
