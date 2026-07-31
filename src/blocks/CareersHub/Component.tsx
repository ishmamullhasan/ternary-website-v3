import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'
import type { CareersHubBlock } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import type { JSX, ReactNode } from 'react'

/**
 * Careers hub — the careers narrative rebuilt in the hub design language (owner direction
 * 2026-07-31), replacing the bento-card grids. Same contract as SolutionsHub: design in code,
 * copy CMS-first with the authored default as fallback, so a half-edited doc never renders
 * broken. The team-voices carousel (careersTeam) and the roles list (jobsBlock) follow this
 * block on the page.
 *
 * Structure: hero (the page h1, CTAs to #roles and /team) → how we work (numbered principle
 * rows, aligned with About's canonical Principles ×4) → how you grow (card panel: ladder rail +
 * three columns) → the two-cities line.
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

const PANEL = 'rounded-xl bg-card'

// ---------------------------------------------------------------------------------------------
// Authored defaults — the restructured copy (COPY_CHANGELOG "Careers redesign"). The principle
// set intentionally mirrors About's canonical Principles ×4 with careers-angled bodies, so the
// site tells one story about how the practice runs.
// ---------------------------------------------------------------------------------------------
const D = {
  heroHeading: 'Build once. Answer for it always.',
  heroSub:
    'We hire engineers who want to answer for what they build — not hand it off. Own systems in production, stay close to the work, and grow inside an engineering institution built for the long term.',
  principlesHeading: 'How we work',
  principlesIntro:
    'The reality of building and sustaining complex systems shapes our culture. Less noise, close proximity to users, a clear orientation toward impact.',
  principles: [
    {
      title: 'Absolute ownership',
      body: 'You take responsibility for systems end to end — design, build, deploy, operate. Engineering here is long-term stewardship, and the consequences of your decisions stay yours to see.',
    },
    {
      title: 'Transparent, low-noise execution',
      body: 'Direct communication and visible progress. Problems are surfaced early, trade-offs are made explicit, and execution stays focused on outcomes rather than noise.',
    },
    {
      title: 'Proximity to impact',
      body: 'You stay close to the people and operations your systems serve. Real workflows, real users, real consequences — the context that makes the work matter.',
    },
    {
      title: 'Talent formed, not bought',
      body: 'We grow engineers deliberately: structured mentorship, honest reviews, and expectations made clear at every step — so seniority means judgment, not tenure.',
    },
  ],
  growthHeading: 'How you grow',
  growthIntro:
    'A defined path, paired with the kind of work that actually stretches you — increasing technical depth alongside expanding ownership and delivery responsibility.',
  ladder: ['Associate', 'Engineer', 'Senior', 'Lead'],
  ladderNote:
    'Advance on the strength of your skill and judgment, with the expectations at every level written down — not discovered after the fact.',
  growthCols: [
    {
      title: 'Real mentorship',
      body: 'Structured mentorship and experienced technical leadership, with clear expectations around accountability, code quality, and professional growth.',
    },
    {
      title: 'Full-lifecycle experience',
      body: 'Strategy, design, build, launch, operate — you understand systems end to end, not just one slice.',
    },
    {
      title: 'A modern stack',
      body: 'Python, JavaScript, Java, and Go on the backend; React, Angular, and Vue on the frontend; Flutter, Swift, and Kotlin on mobile.',
    },
  ],
  placesLine:
    'New York and Dhaka, one standard. Grow inside our Dhaka delivery hub — the core engineering capability behind the organizations we support worldwide — or close to clients in New York.',
}

/* Shared wrapper — same rhythm as the other hub blocks. */
function Section({ children, pad }: { children: ReactNode; pad?: string }): JSX.Element {
  return (
    <section>
      <div className={cn('mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12', pad ?? 'py-[clamp(48px,5vw,80px)]')}>
        {children}
      </div>
    </section>
  )
}

function SectionHead({ title, blurb }: { title: string; blurb: string }): JSX.Element {
  return (
    <Motion
      className="mb-[clamp(28px,4vw,56px)] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
      {...reveal}
    >
      <h2 className="font-display max-w-[20ch] text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.06] font-medium tracking-[-0.03em] text-cream">
        {title}
      </h2>
      <p className="max-w-[46ch] text-[16px] leading-relaxed text-body lg:text-right">{blurb}</p>
    </Motion>
  )
}

/* Thin-line ladder construction — the hero's abstract motif (growth as ascent). Decorative. */
function LadderMark(): JSX.Element {
  return (
    <svg viewBox="0 0 420 340" fill="none" aria-hidden className="h-auto w-full max-w-[420px]">
      {[0, 1, 2, 3].map((i) => {
        const x = 40 + i * 100
        const y = 280 - i * 70
        return (
          <g key={i} stroke="var(--color-line-strong)" strokeWidth="1">
            <line x1={x} y1={y} x2={x + 80} y2={y} />
            <line x1={x + 80} y1={y} x2={x + 100} y2={y - 70} strokeDasharray="3 5" />
            <circle cx={x} cy={y} r="3" fill={i === 3 ? 'var(--color-cream)' : 'none'} />
          </g>
        )
      })}
      <circle cx="440" cy="0" r="3" fill="none" stroke="var(--color-line-strong)" />
    </svg>
  )
}

export function CareersHubComponent(cms: Partial<CareersHubBlock> = {}): JSX.Element {
  const heroHeading = cms.heroHeading || D.heroHeading
  const heroSub = cms.heroSub || D.heroSub
  const principlesHeading = cms.principlesHeading || D.principlesHeading
  const principlesIntro = cms.principlesIntro || D.principlesIntro
  const principles = cms.principles?.length
    ? cms.principles.map((p) => ({ title: p.title ?? '', body: p.body ?? '' }))
    : D.principles
  const growthHeading = cms.growthHeading || D.growthHeading
  const growthIntro = cms.growthIntro || D.growthIntro
  const ladder = cms.ladder?.length ? cms.ladder.map((l) => l.step ?? '') : D.ladder
  const ladderNote = cms.ladderNote || D.ladderNote
  const growthCols = cms.growthCols?.length
    ? cms.growthCols.map((c) => ({ title: c.title ?? '', body: c.body ?? '' }))
    : D.growthCols
  const placesLine = cms.placesLine || D.placesLine

  return (
    <div className="w-full">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      {/* Tight top pad — the container already clears the header; anything more pushed the h1 a
          whole band down the viewport (owner direction 2026-07-31). */}
      <Section pad="pt-2 lg:pt-4 pb-[clamp(40px,6vh,72px)]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
          <div>
            {/* No eyebrow above the h1. Every hub on the site had its section labels removed (owner
                direction); this was the last one left, and the only label anywhere on /careers —
                the growth ladder's rungs are content, not a label, so they stay. */}
            <Motion className="flex flex-col gap-7" {...reveal}>
              <h1 className="font-display max-w-[14ch] text-[clamp(2.75rem,7vw,6rem)] leading-[1.01] font-medium tracking-[-0.04em] text-cream">
                {heroHeading}
              </h1>
              <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">{heroSub}</p>
            </Motion>

            <Motion className="mt-10 flex flex-wrap items-center gap-4 lg:mt-14" {...reveal}>
              <a
                href="#roles"
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-md bg-cream px-5 text-[14px] font-medium tracking-tight text-ink transition-colors duration-200 hover:bg-cream-hover',
                  FOCUS_RING,
                )}
              >
                See open roles
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
              </a>
              <Link
                href="/team"
                className={cn(
                  'inline-flex h-11 items-center rounded-md px-4 text-[14px] text-body transition-colors duration-200 hover:text-cream',
                  FOCUS_RING,
                )}
              >
                Meet the team →
              </Link>
            </Motion>
          </div>

          <Motion className="hidden lg:block" {...reveal}>
            <LadderMark />
          </Motion>
        </div>
      </Section>

      {/* ── HOW WE WORK ──────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead title={principlesHeading} blurb={principlesIntro} />
        <div>
          {principles.map((p, i) => (
            <Motion key={p.title || i} {...revealItem(i)}>
              <div className="grid grid-cols-1 gap-3 border-t border-line py-8 sm:grid-cols-[80px_minmax(0,0.9fr)_minmax(0,1.4fr)] sm:gap-x-8 lg:py-10">
                <p className="font-mono text-[13px] tabular-nums text-subtle">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="font-display text-[clamp(1.25rem,2.2vw,1.625rem)] leading-[1.15] font-medium tracking-[-0.02em] text-cream">
                  {p.title}
                </h3>
                <p className="max-w-[58ch] text-[15.5px] leading-relaxed text-body">{p.body}</p>
              </div>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── HOW YOU GROW ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead title={growthHeading} blurb={growthIntro} />
        <Motion className={cn('p-7 lg:p-10', PANEL)} {...reveal}>
          {/* Ladder rail — the path itself, in the label voice. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-7 lg:pb-8">
            {ladder.map((step, i) => (
              <span key={step || i} className="flex items-center gap-4">
                <span
                  className={cn(
                    'font-mono text-[13px] uppercase tracking-[0.1em]',
                    i === ladder.length - 1 ? 'text-cream' : 'text-body',
                  )}
                >
                  {step}
                </span>
                {i < ladder.length - 1 && (
                  <ArrowRight size={14} strokeWidth={1.5} aria-hidden className="text-subtle" />
                )}
              </span>
            ))}
            <p className="mt-2 w-full max-w-[70ch] text-[14px] leading-relaxed text-body lg:mt-3">{ladderNote}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 pt-7 md:grid-cols-3 lg:gap-10 lg:pt-8">
            {growthCols.map((c, i) => (
              <Motion key={c.title || i} {...revealItem(i)}>
                <h3 className="mb-2.5 font-display text-[17px] leading-[1.2] font-medium tracking-[-0.01em] text-cream">
                  {c.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-body">{c.body}</p>
              </Motion>
            ))}
          </div>
        </Motion>

        {/* The two-cities line — one quiet sentence, not a section. */}
        <Motion {...reveal}>
          <p className="mx-auto mt-[clamp(40px,5vw,64px)] max-w-[68ch] text-center text-[15.5px] leading-relaxed text-body">
            {placesLine}
          </p>
        </Motion>
      </Section>
    </div>
  )
}
