import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { JSX } from 'react'

/**
 * Capability detail — premium redesign (design/capability-detail-redesign).
 *
 * A reusable TEMPLATE for all eight capability pages, worked here with "Agentic Architecture".
 * The page moves the reader through one arc — what it is → how we do it → proof → related → talk —
 * with each section given a visibly different layout so the page reads as a progression, never
 * repetition. There is exactly ONE definitional moment (Section 01); the old page said the same
 * thing twice and this removes that.
 *
 * Content lives in the CAPABILITY object below as the worked example. In production each field maps
 * 1:1 to the `capability` collection (heroSection, principles, method, caseStudies,
 * relatedCapabilities, cta) — this file is the presentation layer, authored standalone so the
 * design can be reviewed at /capability-template without depending on CMS data.
 *
 * Extends the existing system only: brand tokens (page/ink/card/cream/body/subtle/line), Poppins
 * display + Inter body, the shared Motion reveal wrapper, LocalizedLink, and the "agentic = one
 * impulse diverging to three agents" art motif (see components/capability/CapabilityArt).
 */

export const metadata: Metadata = {
  title: 'Agentic Architecture — Capability',
  description:
    'Autonomy is an architectural property, not a prompt. We build agent systems with explicit planning, bounded tool access, and verification where a wrong answer would be expensive.',
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Shared reveal — quiet upward fade, fires once. Motion already honors prefers-reduced-motion.
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
  transition: { duration: 0.55, ease: EASE, delay: Math.min(index * 0.07, 0.42) },
})

// Focus-visible affordance shared across every interactive element (matches the detail routes).
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// ---------------------------------------------------------------------------------------------
// Worked-example content ("Agentic Architecture"). One object; maps 1:1 to the capability schema.
// Client names and metrics are deliberate, clearly-marked placeholders — never fabricate outcomes.
// ---------------------------------------------------------------------------------------------
const CAPABILITY = {
  eyebrow: 'Capability',
  name: 'Agentic Architecture',
  positioning:
    'Autonomy is an architectural property, not a prompt. We build agent systems with explicit planning, bounded tool access, and verification at every step where a wrong answer would be expensive — then we carry production responsibility for the result.',

  // Section 01 — the single definitional moment.
  what: {
    heading: 'Systems that pursue goals, not prompts.',
    paragraphs: [
      'An agentic system plans, acts, and adapts toward a goal rather than returning a single answer. Done well, that autonomy is designed in — as explicit structure, bounded authority, and verification — not coaxed out of a model at runtime.',
      'We treat an agent as an engineered system: what it may decide, what it may touch, and how each step is checked. That discipline is what makes autonomy safe to run in production — and what we take responsibility for.',
    ],
    principles: [
      {
        title: 'Autonomous decision-making',
        body: 'Agents choose the next step from state and goals, not from a fixed script.',
      },
      {
        title: 'Adaptive behavior',
        body: 'Behavior adjusts to new inputs and feedback instead of breaking on the unexpected.',
      },
      {
        title: 'Collaborative intelligence',
        body: 'Agents coordinate with each other — and with people — around a shared task.',
      },
    ],
  },

  // Section 02 — method as a deliberate, connected sequence.
  how: {
    heading: 'How we build them.',
    intro: 'A deliberate sequence: design the agent, bound what it can reach, then orchestrate and verify.',
    steps: [
      {
        title: 'Agent design',
        body: 'Define the goal, the planning strategy, and the bounds each agent operates within.',
      },
      {
        title: 'Tooling & integrations',
        body: 'Give agents typed, permissioned access to the systems that do the real work.',
      },
      {
        title: 'Orchestration & workflows',
        body: 'Compose agents into verified workflows with checkpoints where errors are costly.',
      },
    ],
  },

  // Section 03 — proof. Placeholders stay placeholders.
  proof: {
    heading: 'Proof it works.',
    intro: 'A few engagements where agentic systems carried real production responsibility.',
    cases: [
      {
        year: '2024',
        industry: 'Financial services',
        title: 'Autonomous reconciliation for a payments platform',
        problem:
          '[Client]’s finance team hand-matched thousands of cross-ledger exceptions a month; the backlog grew faster than headcount.',
        approach:
          'We built a planning agent with bounded access to their ledger APIs, a verification step on every proposed match, and a review queue for low-confidence cases.',
        outcome: 'Exceptions now clear continuously, with a full audit trail behind every automated decision.',
        result: '[metric] reduction in manual reconciliation time',
      },
      {
        year: '2023',
        industry: 'Healthcare',
        title: 'Clinical intake triage with guardrails',
        problem: '[Client] needed to route incoming patient documents without exposing PHI to unbounded model calls.',
        approach:
          'A constrained agent classified and routed documents inside their VPC, with explicit tool allow-lists and verification before any downstream write.',
        outcome: 'Routing runs unattended within the compliance boundary, escalating only the cases that need a human.',
        result: '[metric] of intake documents routed without manual handling',
      },
      {
        year: '2024',
        industry: 'Logistics',
        title: 'Exception-handling agents for a fleet network',
        problem: 'Dispatchers at [Client] reacted to disruptions manually, one screen at a time.',
        approach:
          'We designed agents that plan around live constraints, call routing and comms tools within set bounds, and verify each action against policy before executing.',
        outcome: 'Routine disruptions resolve automatically; dispatchers focus on the genuinely novel ones.',
        result: '[metric] of disruptions resolved without dispatcher intervention',
      },
    ],
  },

  // Section 04 — cross-links back into the hub.
  related: {
    lead: 'Most systems cross two or three disciplines.',
    items: [
      { title: 'Artificial Intelligence', body: 'Models, evaluation, and the data that feeds them.', slug: 'artificial-intelligence' },
      { title: 'Platformization', body: 'The runtime and guardrails agents operate inside.', slug: 'platformization' },
      { title: 'DevOps & Automation', body: 'Shipping, observing, and operating it in production.', slug: 'devops-automation' },
    ],
  },

  cta: {
    heading: 'Have a system that needs to act, not just answer?',
    body: 'Tell us where the work is today and we’ll map the shortest path to an agent you can trust in production.',
  },
} as const

// ---------------------------------------------------------------------------------------------
// Small shared primitives
// ---------------------------------------------------------------------------------------------

// Palantir-style section marker: "Section 02 / Label", tabular numerals, tight functional label.
function SectionMarker({ index, label }: { index: number; label: string }): JSX.Element {
  return (
    <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-subtle">
      <span className="tabular-nums text-cream/70">{`Section ${String(index).padStart(2, '0')}`}</span>
      <span aria-hidden className="text-subtle/50">
        /
      </span>
      <span>{label}</span>
    </p>
  )
}

// Bespoke, on-brand hero figure. Echoes the system's "agentic" motif — one impulse diverging to
// three agents — as an engineering diagram: a planner node, three bounded agents, a verification
// gate on each path, over a faint wireframe grid. Decorative, so aria-hidden and contrast-exempt.
function AgenticFigure(): JSX.Element {
  const agents = [96, 220, 344]
  const arcs = [
    'M92,214 C214,190 252,112 384,98',
    'M94,220 C214,220 252,220 384,220',
    'M92,226 C214,250 252,328 384,342',
  ]
  return (
    <svg
      viewBox="0 0 520 440"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* faint wireframe grid */}
      <g stroke="#f4f3ec" strokeOpacity="0.05">
        {[60, 130, 200, 270, 340, 410].map((y) => (
          <line key={`h${y}`} x1="24" y1={y} x2="496" y2={y} />
        ))}
        {[84, 176, 268, 360, 452].map((x) => (
          <line key={`v${x}`} x1={x} y1="36" x2={x} y2="404" />
        ))}
      </g>

      {/* diverging paths — the impulse fanning out to three agents */}
      <g stroke="#f4f3ec" strokeOpacity="0.4" strokeWidth="1.25">
        {arcs.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* planner node */}
      <circle cx="70" cy="220" r="19" stroke="#f4f3ec" strokeOpacity="0.7" strokeWidth="1.25" />
      <circle cx="70" cy="220" r="4" fill="#f4f3ec" fillOpacity="0.85" />

      {/* agent nodes + verification gates (diamonds) */}
      {agents.map((cy) => (
        <g key={cy}>
          <circle cx="400" cy={cy} r="15" stroke="#f4f3ec" strokeOpacity="0.6" strokeWidth="1.25" />
          <circle cx="400" cy={cy} r="3.5" fill="#f4f3ec" fillOpacity="0.7" />
          <line x1="415" y1={cy} x2="452" y2={cy} stroke="#f4f3ec" strokeOpacity="0.3" strokeWidth="1.25" />
          <rect
            x="452"
            y={cy - 9}
            width="18"
            height="18"
            transform={`rotate(45 461 ${cy})`}
            stroke="#f4f3ec"
            strokeOpacity="0.45"
            strokeWidth="1.25"
          />
        </g>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------------------------
export default function CapabilityTemplatePage(): JSX.Element {
  const c = CAPABILITY

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-24 px-5 pb-24 lg:gap-32 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <section className="w-full pt-10 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Motion
            className="flex flex-col items-start gap-7"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="text-[12px] uppercase tracking-[0.18em] text-subtle">{c.eyebrow}</span>

            <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-medium leading-[1.02] tracking-[-0.04em] text-cream">
              {c.name}
            </h1>

            <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-body">{c.positioning}</p>

            <Link
              href="/contact"
              className={cn(
                'mt-2 inline-flex items-center gap-2 rounded-md bg-cream px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover',
                FOCUS_RING,
              )}
            >
              Talk to us
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
          </Motion>

          {/* Abstract engineering figure — quiet, spacious, on a faint framed panel. */}
          <Motion
            className="relative aspect-[520/440] w-full overflow-hidden rounded-md ring-1 ring-line"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(120% 120% at 72% 24%, #16151b 0%, #0d0c11 52%, #08080b 100%)' }}
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.12] mix-blend-overlay"
            />
            <div className="absolute inset-0 p-6 lg:p-10">
              <AgenticFigure />
            </div>
          </Motion>
        </div>
      </section>

      {/* ── SECTION 01 · WHAT IT IS (single definitional moment) ─────────────────────────── */}
      <section className="w-full">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Definition — text-forward left column */}
          <Motion className="flex flex-col gap-6" {...reveal}>
            <SectionMarker index={1} label="What it is" />
            <h2 className="max-w-xl font-display text-[clamp(1.75rem,3.4vw,2.375rem)] font-medium leading-[1.1] tracking-[-0.03em] text-cream">
              {c.what.heading}
            </h2>
            <div className="flex max-w-xl flex-col gap-4">
              {c.what.paragraphs.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-body">
                  {p}
                </p>
              ))}
            </div>
          </Motion>

          {/* Principles — three minimal tiles, stacked. Distinct from the open method sequence. */}
          <div className="flex flex-col gap-3">
            {c.what.principles.map((p, i) => (
              <Motion
                key={p.title}
                className="flex flex-col gap-2 rounded-md border border-white/[0.07] bg-ink p-6 transition-colors duration-300 hover:border-white/[0.14]"
                {...revealItem(i)}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-[12px] tabular-nums text-cream/50">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-[16px] font-medium tracking-[-0.02em] text-cream">{p.title}</h3>
                </div>
                <p className="pl-[27px] text-[14px] leading-relaxed text-body">{p.body}</p>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 02 · HOW WE DO IT (connected numbered sequence) ──────────────────────── */}
      <section className="w-full">
        <Motion className="mb-14 flex max-w-2xl flex-col gap-5" {...reveal}>
          <SectionMarker index={2} label="How we do it" />
          <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.375rem)] font-medium leading-[1.1] tracking-[-0.03em] text-cream">
            {c.how.heading}
          </h2>
          <p className="text-[16px] leading-relaxed text-body">{c.how.intro}</p>
        </Motion>

        <div className="relative">
          {/* connector line — desktop only, threaded through the step nodes */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-[7px] hidden h-px bg-gradient-to-r from-line via-line-strong to-line lg:block"
          />
          <ol className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-10">
            {c.how.steps.map((s, i) => (
              <Motion tag="li" key={s.title} className="flex flex-col gap-6" {...revealItem(i)}>
                {/* node on the sequence line */}
                <span
                  aria-hidden
                  className="relative z-10 block size-3.5 rounded-full border border-line-strong bg-page ring-4 ring-page"
                >
                  <span className="absolute inset-[3px] rounded-full bg-cream/70" />
                </span>
                <div className="flex flex-col gap-3">
                  <span className="font-display text-[clamp(2.5rem,4vw,3.25rem)] font-medium leading-none tabular-nums tracking-[-0.04em] text-cream/20">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-[18px] font-medium tracking-[-0.02em] text-cream">{s.title}</h3>
                  <p className="max-w-xs text-[15px] leading-relaxed text-body">{s.body}</p>
                </div>
              </Motion>
            ))}
          </ol>
        </div>
      </section>

      {/* ── SECTION 03 · PROOF / SELECTED WORK (editorial rows) ──────────────────────────── */}
      <section className="w-full">
        <Motion className="mb-12 flex max-w-2xl flex-col gap-5" {...reveal}>
          <SectionMarker index={3} label="Selected work" />
          <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.375rem)] font-medium leading-[1.1] tracking-[-0.03em] text-cream">
            {c.proof.heading}
          </h2>
          <p className="text-[16px] leading-relaxed text-body">{c.proof.intro}</p>
        </Motion>

        <div className="flex flex-col">
          {c.proof.cases.map((cs, i) => (
            <Motion
              tag="article"
              key={cs.title}
              className="grid grid-cols-1 gap-6 border-t border-line py-10 lg:grid-cols-[0.85fr_2fr] lg:gap-12 lg:py-12"
              {...revealItem(i)}
            >
              {/* left: meta + title */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-subtle">
                  <span className="tabular-nums text-cream/70">{cs.year}</span>
                  <span aria-hidden className="text-subtle/50">
                    /
                  </span>
                  <span>{cs.industry}</span>
                </div>
                <h3 className="max-w-xs font-display text-[20px] font-medium leading-snug tracking-[-0.02em] text-cream">
                  {cs.title}
                </h3>
              </div>

              {/* right: Problem / Approach / Outcome + one result */}
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {(
                    [
                      ['Problem', cs.problem],
                      ['Approach', cs.approach],
                      ['Outcome', cs.outcome],
                    ] as const
                  ).map(([label, text]) => (
                    <div key={label} className="flex flex-col gap-2">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">{label}</span>
                      <p className="text-[14px] leading-relaxed text-body">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                  <p className="text-[15px] font-medium tracking-[-0.02em] text-cream">
                    <span className="text-cream/45">Result — </span>
                    {cs.result}
                  </p>
                  <Link
                    href="/stories"
                    className={cn(
                      'group inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-cream transition-colors duration-300 hover:text-cream/70',
                      FOCUS_RING,
                    )}
                  >
                    Read the story
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2}
                      aria-hidden
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>
            </Motion>
          ))}
        </div>
      </section>

      {/* ── SECTION 04 · RELATED CAPABILITIES (slim strip) ──────────────────────────────── */}
      <section className="w-full">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.8fr_2.2fr] lg:gap-12">
          <Motion className="flex flex-col gap-4" {...reveal}>
            <SectionMarker index={4} label="Related" />
            <p className="max-w-xs font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium leading-tight tracking-[-0.02em] text-cream">
              {c.related.lead}
            </p>
          </Motion>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {c.related.items.map((r, i) => (
              <Motion key={r.title} className="h-full" {...revealItem(i)}>
                <Link
                  href={`/capabilities/${r.slug}`}
                  className={cn(
                    'group flex h-full flex-col gap-2 rounded-md border border-white/[0.07] bg-ink p-5 transition-colors duration-300 hover:border-white/[0.16]',
                    FOCUS_RING,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-medium tracking-[-0.02em] text-cream">{r.title}</h3>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2}
                      aria-hidden
                      className="shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream"
                    />
                  </div>
                  <p className="text-[13px] leading-relaxed text-subtle">{r.body}</p>
                </Link>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 05 · CLOSING CTA (calm, signature noise-gradient) ───────────────────── */}
      <Motion tag="section" className="relative overflow-hidden rounded-md border border-white/[0.06] p-10 lg:p-16" {...reveal}>
        <span aria-hidden className="absolute inset-0">
          <span
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(135% 135% at 22% 18%, #6d3bd6 0%, #3a1c8c 46%, #1a1448 100%)' }}
          />
          <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
          <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />
        </span>

        <div className="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <h2 className="max-w-2xl font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
            {c.cta.heading}
          </h2>
          <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:w-auto sm:flex-row lg:ml-auto">
            <Link
              href="/contact"
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-md bg-cream px-6 py-3 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-cream-hover sm:w-auto',
                FOCUS_RING,
              )}
            >
              Talk to an engineer
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/stories"
              className={cn(
                'inline-flex w-full items-center justify-center rounded-md border border-white/20 bg-white/[0.06] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-white/[0.12] sm:w-auto',
                FOCUS_RING,
              )}
            >
              See the work
            </Link>
          </div>
        </div>
      </Motion>
    </div>
  )
}
