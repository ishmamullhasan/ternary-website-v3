import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { SolutionMark } from '@/components/solutions/SolutionsFrame'
import '@/components/solutions/solutionsFrame.css'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'

/**
 * Solutions hub — landing rebuild, ported from public/hub/solutions-hub-ternary.html into Ternary's
 * own design language: monochrome cream-on-near-black (no amber/tan), Poppins display + Inter body,
 * the brand tokens (page/ink/line/subtle), tabular numerals in place of a mono face, the shared
 * Motion scroll-reveal, and one signature noise-gradient CTA moment — matching /capabilities-hub.
 *
 * Structure: hero → four at a glance (jump index) → the four solutions (who/what/get/proof) → the
 * three engagement models → the compare matrix → closing CTA → a quiet careers line. Authored as a
 * self-contained server component; content lives in local const arrays.
 */

export const metadata: Metadata = {
  title: 'Solutions — Ways in. One standard.',
  description:
    'Ways to work with Ternary — build something new, modernize what you have, extend your team, or hand us the keys to production.',
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
// Content — four solutions (jump-index + full scenes), engagement models, compare matrix.
// ---------------------------------------------------------------------------------------------
const SOLUTIONS = [
  {
    id: 's1',
    art: 0,
    name: 'Product Development',
    tagline: 'Take an idea to a real product.',
    who: 'You have something to build and no team — or a team that is already full.',
    what: 'We take it from a rough idea to a launched system: discovery, architecture, design, build, release. One senior team, shipping continuously, with you in the room.',
    get: 'A launched product with the pipelines, tests, and documentation to grow on — and the team that built it, still on call.',
    proof: {
      client: 'Alley Analytix',
      body: 'sensor hardware, real-time motion processing, and coaching dashboards, built end to end.',
    },
  },
  {
    id: 's2',
    art: 1,
    name: 'Enterprise Transformation',
    tagline: 'Replace what you have outgrown.',
    who: 'You are running something critical that is getting expensive, fragile, or impossible to hire for — or the “system” is still paper, phone calls, and spreadsheets the business has outgrown.',
    what: 'We map how the work actually happens today, then move it across piece by piece. Sometimes that means replacing legacy systems; sometimes it means building your first real one. Nothing switches off until its replacement has proven itself.',
    get: 'New platform live. Old ways retired. Business uninterrupted.',
    proof: {
      client: 'FAROGL',
      body: 'an oil and gas operation taken from manual workflows to one governed ERP, in phases people actually adopted.',
    },
  },
  {
    id: 's3',
    art: 2,
    name: 'Engineering Augmentation',
    tagline: 'Add senior engineers to your team.',
    who: 'You know exactly what to build. You need more senior hands building it.',
    what: 'We place experienced engineers inside your team — your process, your tooling, your rituals. Named people, not rotating resources.',
    get: 'Delivery speed you can measure, from engineers you would have hired yourself.',
    proof: null,
  },
  {
    id: 's4',
    art: 3,
    name: 'Managed Systems',
    tagline: 'We run what we build.',
    who: 'You have systems in production and nobody whose actual job is keeping them healthy.',
    what: 'Monitoring, patching, incident response — and the unglamorous roadmap of keeping software current, so it never becomes next year’s legacy problem.',
    get: 'Uptime you stop thinking about.',
    proof: {
      client: 'Counterfoil',
      body: 'a platform Ternary builds and runs.',
    },
  },
] as const

const MODELS = [
  {
    name: 'Frame',
    tag: 'Fixed scope · timeline · price',
    body: 'For work with a clear finish line.',
    ideal: 'Launches, migrations, proofs of concept.',
  },
  {
    name: 'Flow',
    tag: 'Dedicated team · continuous',
    body: 'For products that keep evolving.',
    ideal: 'Long-term product development, continuous delivery.',
  },
  {
    name: 'Orchestra',
    tag: 'Senior capacity · on demand',
    body: 'For teams that need depth without the headcount.',
    ideal: 'Filling skill gaps, scaling delivery.',
  },
] as const

const COMPARE_COLS = ['Product Development', 'Enterprise Transformation', 'Engineering Augmentation', 'Managed Systems']

const COMPARE_ROWS: { label: string; cells: (ReactNode | string)[]; tabular?: boolean }[] = [
  {
    label: 'Best when',
    cells: [
      'You are building something new',
      'A critical system is aging out — or still runs on paper',
      'Your roadmap outruns your team',
      'Your systems need an owner',
    ],
  },
  {
    label: 'Typical duration',
    tabular: true,
    cells: ['3–9 months', '12+ months', 'Rolling, quarterly', 'Ongoing'],
  },
  {
    label: 'Team shape',
    cells: ['One senior pod', 'Coordinated workstreams', 'Embedded engineers', 'Dedicated ops coverage'],
  },
  {
    label: 'Roadmap owner',
    cells: ['Shared', 'Shared', 'You', 'We propose, you approve'],
  },
  {
    label: 'What we hand over',
    cells: [
      'A launched product + docs',
      'A retired legacy + a live platform',
      'Merged code, every week',
      'Reports, uptime, a healthy system',
    ],
  },
  {
    label: 'Engagement model',
    cells: [
      <>
        <b className="font-medium text-cream">Frame</b> or <b className="font-medium text-cream">Flow</b>
      </>,
      <>
        <b className="font-medium text-cream">Flow</b> or <b className="font-medium text-cream">Orchestra</b>
      </>,
      <b key="orchestra" className="font-medium text-cream">
        Orchestra
      </b>,
      <b key="flow" className="font-medium text-cream">
        Flow
      </b>,
    ],
  },
]

// Eyebrow — hairline + uppercase micro-label, cream-accented rule.
function Eyebrow({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em] text-subtle">
      <span aria-hidden className="h-px w-6 bg-cream/60" />
      {children}
    </span>
  )
}

// A single who/what/get row inside a solution scene.
function Fact({ label, children, emphasis }: { label: string; children: ReactNode; emphasis?: boolean }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-7">
      <h3 className="pt-0.5 text-[11px] uppercase tracking-[0.1em] text-subtle">{label}</h3>
      <p
        className={cn(
          'max-w-[52ch] leading-relaxed',
          emphasis ? 'text-[17px] font-medium text-cream' : 'text-[15.5px] text-body',
        )}
      >
        {children}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
export default function SolutionsHubPage(): JSX.Element {
  return (
    <div className="w-full pb-24 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line/60">
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
            <Eyebrow>Solutions · Ways in</Eyebrow>
            <h1 className="max-w-[15ch] font-display text-[clamp(2.75rem,7vw,6rem)] font-medium leading-[1.01] tracking-[-0.04em] text-cream">
              Built to outlast.
            </h1>
            <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">
              Ways to work with us — build something new, modernize what you have, extend your team, or hand us the keys
              to production. One engineering standard behind all of them.
            </p>
          </Motion>

          {/* hero index — jump links to the solution scenes below. Chips rather than a bare row of
              words: with the leading ordinal gone there is nothing separating four plain text links,
              and they read as one run-on line. The filled shape is what now says "these are controls". */}
          <Motion className="mt-14 flex flex-wrap gap-2.5 border-t border-line/70 pt-7 lg:mt-20" {...reveal}>
            {SOLUTIONS.map((s) => (
              <Link
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  'inline-flex items-center rounded-full bg-ink px-4 py-2 text-[13.5px] text-body transition-colors duration-200 hover:bg-[#23211d] hover:text-cream',
                  FOCUS_RING,
                )}
              >
                {s.name}
              </Link>
            ))}
          </Motion>
        </div>
      </section>

      {/* ── FOUR AT A GLANCE ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-24 lg:py-32">
        <Motion className="mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20" {...reveal}>
          <div className="flex flex-col gap-4">
            <Eyebrow>At a glance</Eyebrow>
            <h2 className="font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
              The ways in
            </h2>
          </div>
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
            Pick the shape that fits where you are. Each opens onto the same standard of engineering.
          </p>
        </Motion>

        <div className="border-b border-line">
          {SOLUTIONS.map((s, i) => (
            <Motion key={s.id} {...revealItem(i)}>
              <Link
                href={`#${s.id}`}
                className={cn(
                  'group grid grid-cols-1 items-center gap-x-8 gap-y-2 border-t border-line py-8 transition-colors duration-300 hover:bg-gradient-to-r hover:from-white/[0.03] hover:to-transparent lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_3rem] lg:py-10',
                  FOCUS_RING,
                )}
              >
                <h3 className="font-display text-[clamp(1.5rem,2.8vw,2.125rem)] font-medium leading-[1.1] tracking-[-0.025em] text-cream">
                  {s.name}
                </h3>
                <p className="max-w-[48ch] text-[15px] leading-relaxed text-body lg:col-start-2">{s.tagline}</p>
                <ArrowUpRight
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden
                  className="hidden justify-self-end text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream lg:col-start-3 lg:row-start-1 lg:block"
                />
              </Link>
            </Motion>
          ))}
        </div>
      </section>

      {/* ── THE FOUR SOLUTIONS ───────────────────────────────────────────────────────────── */}
      {SOLUTIONS.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-line/60">
          <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-12 px-5 md:px-8 lg:px-12 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-20 lg:py-32">
            <Motion className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start" {...reveal}>
              {/* The solution's NAME is the heading. It used to be a 12px eyebrow while the tagline
                  took the h2 — so the thing the section is actually about was its smallest type, and
                  four sections in a row were titled by a sentence rather than by a name. */}
              <h2 className="max-w-[13ch] font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-cream">
                {s.name}
              </h2>
              <p className="max-w-[28ch] text-[clamp(1.0625rem,1.7vw,1.375rem)] leading-[1.35] text-body">
                {s.tagline}
              </p>
              {/* The scene from the home page's solutions frame, one lane per solution — what the
                  decorative "02" numeral used to occupy, carrying the idea instead of the count. */}
              <div className="mt-2 w-full max-w-[280px]">
                <SolutionMark art={s.art} />
              </div>
            </Motion>

            <div className="flex flex-col gap-7">
              <Motion {...revealItem(0)}>
                <Fact label="Who it's for">{s.who}</Fact>
              </Motion>
              <Motion {...revealItem(1)}>
                <Fact label="What we do">{s.what}</Fact>
              </Motion>
              <Motion {...revealItem(2)}>
                <Fact label="What you get" emphasis>
                  {s.get}
                </Fact>
              </Motion>
              {/* Proof slot: named client with written permission only. With no proof, the slot
                  hides entirely — an empty proof line is better than a vague one. */}
              {s.proof && (
                <Motion {...revealItem(3)}>
                  <div className="grid grid-cols-1 gap-1.5 border-t border-line pt-6 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-x-7">
                    <h3 className="pt-0.5 text-[11px] uppercase tracking-[0.1em] text-subtle">Proof</h3>
                    <p className="max-w-[52ch] text-[15.5px] leading-relaxed text-body">
                      <span className="text-cream">{s.proof.client}</span> — {s.proof.body}{' '}
                      <Link
                        href="/stories"
                        className={cn(
                          'group/story mt-1 inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-cream',
                          FOCUS_RING,
                        )}
                      >
                        Read the story
                        <ArrowRight
                          size={14}
                          strokeWidth={2}
                          aria-hidden
                          className="transition-transform duration-300 group-hover/story:translate-x-0.5"
                        />
                      </Link>
                    </p>
                  </div>
                </Motion>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* ── ENGAGEMENT MODELS ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-line/60">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-24 lg:py-32">
          <Motion className="mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20" {...reveal}>
            <div className="flex flex-col gap-4">
              <Eyebrow>Engagement models</Eyebrow>
              <h2 className="font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                How the work is structured
              </h2>
            </div>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
              Shapes of engagement. Every solution runs on one — or moves between them as the work changes.
            </p>
          </Motion>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {MODELS.map((m, i) => (
              <Motion
                key={m.name}
                className="group flex h-full flex-col rounded-md border border-line bg-ink p-8 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong"
                {...revealItem(i)}
              >
                <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-[-0.02em] text-cream">
                  {m.name}
                  <sup className="ml-0.5 text-[0.5em] align-super font-medium text-subtle">™</sup>
                </h3>
                <span className="mt-3 text-[11px] uppercase tracking-[0.08em] text-cream/70">{m.tag}</span>
                <p className="mt-4 flex-1 text-[15.5px] leading-relaxed text-body">{m.body}</p>
                <div className="mt-6 border-t border-line pt-5">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.06em] text-body">Ideal for</span>
                  <p className="text-[13.5px] leading-relaxed text-subtle">{m.ideal}</p>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARE (the showpiece) ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line/60">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 py-24 lg:py-32">
          <Motion className="mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20" {...reveal}>
            <div className="flex flex-col gap-4">
              <Eyebrow>Compare</Eyebrow>
              <h2 className="font-display text-[clamp(1.875rem,4vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-cream">
                Side by side. Honest answers.
              </h2>
            </div>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">
              No winner. The right column is the one that matches your situation.
            </p>
          </Motion>

          <Motion className="overflow-x-auto rounded-md border border-line" {...reveal}>
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-[150px] border-b border-line-strong bg-ink px-5 py-5" />
                  {COMPARE_COLS.map((col) => (
                    <th
                      key={col}
                      className="border-b border-line-strong bg-ink px-5 py-5 align-bottom font-display text-[15px] font-medium whitespace-nowrap text-cream"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-b-0">
                    <th
                      scope="row"
                      className="bg-ink px-5 py-4 text-left text-[11px] font-normal uppercase tracking-[0.06em] whitespace-nowrap text-subtle"
                    >
                      {row.label}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        className={cn(
                          'px-5 py-4 align-top text-[14.5px] leading-relaxed text-body',
                          row.tabular && 'font-mono tabular-nums',
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Motion>
        </div>
      </section>

      {/* ── CTA (signature noise-gradient moment) ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12">
        <Motion
          tag="div"
          className="relative overflow-hidden rounded-md border border-white/[0.06] p-10 lg:p-16"
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
            <h2 className="max-w-[16ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-cream">
              Still not sure which one you need?
            </h2>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-body">
              Neither are most people at this stage — that&apos;s our job, not yours. Tell us the problem, and
              we&apos;ll tell you the shape.
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

      {/* ── CAREERS STRIP ────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12 pt-16 text-center lg:pt-20">
        <Motion tag="p" className="text-[13.5px] leading-relaxed text-body" {...reveal}>
          Engineers: we&apos;re usually hiring.{' '}
          <Link
            href="/careers"
            className={cn('group/careers ml-1 inline-flex items-center gap-1.5 font-medium text-cream', FOCUS_RING)}
          >
            See open roles
            <ArrowRight
              size={13}
              strokeWidth={2}
              aria-hidden
              className="transition-transform duration-300 group-hover/careers:translate-x-0.5"
            />
          </Link>
        </Motion>
      </section>
    </div>
  )
}
