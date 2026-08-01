import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import NetworkMark from '@/components/network/NetworkMark'
import RevealText from '@/components/text/RevealText'
import { cn } from '@/lib/utils'
import type { CapabilitiesHubBlock } from '@/payload-types'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { JSX, ReactNode } from 'react'

/**
 * Capabilities hub (CMS build-out 2026-08-01). The eight-discipline index, ported verbatim from
 * the previous hardcoded /capabilities page into an editable block. Same contract as SolutionsHub:
 * the design is code, the copy is CMS-first, and every field left empty falls back to the authored
 * default below so a half-authored doc can never render broken. Design is unchanged.
 *
 * Structure: hero + index → framing statement → the index (centerpiece) → how they combine →
 * the one standard → closing CTA. Structure comes from surfaces, not rules — no hairlines.
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
// Authored defaults — the previous hardcoded content, verbatim. base-three index → detail slugs.
// ---------------------------------------------------------------------------------------------
const DEFAULT_CAPABILITIES = [
  {
    name: 'Agentic Architecture',
    slug: 'agentic-architecture',
    body: 'AI that does real work — and answers for it. Systems that plan, act, and verify, with people in command of anything that matters.',
    tags: ['Multi-agent systems', 'Tool use & permissions', 'Evals & guardrails', 'Human oversight'],
  },
  {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    body: 'LLM applications and machine learning built for production, not demos. Shipped, monitored, and owned after launch.',
    tags: ['LLM applications', 'ML pipelines', 'Retrieval & search', 'Model operations'],
  },
  {
    name: 'Data & Analytics',
    slug: 'data-analytics',
    body: 'One source of truth. Pipelines, warehouses, and numbers your teams can actually act on.',
    tags: ['Data pipelines', 'Warehousing', 'Decision analytics', 'Governance'],
  },
  {
    name: 'Cloud Transformation',
    slug: 'cloud-transformation',
    body: 'Move to the cloud without betting the business on the move. Architecture, migration, and operations — governed for regulated environments.',
    tags: ['Migration', 'Cloud-native architecture', 'Platform operations', 'Compliance'],
  },
  {
    name: 'Platformization',
    slug: 'platformization',
    body: 'Turn one-off builds into shared platforms, so every next project starts further ahead instead of from zero.',
    tags: ['Internal platforms', 'Reusable services', 'APIs & SDKs', 'Developer experience'],
  },
  {
    name: 'Digital Experiences',
    slug: 'digital-experiences',
    body: 'Web, mobile, and product interfaces people trust at first use — clear, fast, and dependable on every device.',
    tags: ['Web & mobile', 'Product design', 'Accessibility', 'Performance'],
  },
  {
    name: 'DevOps & Automation',
    slug: 'devops-automation',
    body: 'We make shipping boring. More releases, fewer incidents, and no two-a.m. surprises.',
    tags: ['CI/CD', 'Observability', 'Reliability', 'Release automation'],
  },
  {
    name: 'Internet of Things',
    slug: 'internet-of-things',
    body: 'From the sensor to the dashboard — devices, firmware, and the data they send home.',
    tags: ['Firmware', 'Edge computing', 'Telemetry', 'Device fleets'],
  },
]

const DEFAULT_COMBINATIONS = [
  {
    tag: 'Capital markets',
    title: 'Dhaka Stock Exchange',
    body: "A national exchange's public platform, rebuilt from the ground up — modern, bilingual, and accessible — without touching the trading core.",
    caps: ['Digital Experiences', 'Data & Analytics', 'Cloud Transformation'],
  },
  {
    tag: 'Capital markets · AI',
    title: 'LankaBangla Securities',
    body: 'A governed, air-gapped AI layer that lets brokerage advisors query market and portfolio data in plain language — production systems never exposed.',
    caps: ['Agentic Architecture', 'Artificial Intelligence', 'Data & Analytics'],
  },
  {
    tag: 'Experience economy',
    title: 'Counterfoil',
    body: 'A booking monolith rebuilt as an event-driven platform — while the original stayed live and taking bookings the whole time.',
    caps: ['Platformization', 'DevOps & Automation', 'Digital Experiences'],
  },
]

const DEFAULT_STANDARD = [
  {
    title: 'Led by a practitioner',
    body: 'Every capability has a named lead who still builds. You can meet them before you sign anything.',
  },
  {
    title: 'Proven in production',
    body: "We list only what we currently run for clients. If it isn't live somewhere, it isn't on this page.",
  },
  {
    title: 'Owned past launch',
    body: 'Capability work ships with monitoring, documentation, and a handover we stand behind — or we keep running it ourselves.',
  },
]

/* Surfaces, not rules — the same language as /solutions. */
const PANEL = 'rounded-xl bg-card'
const PANEL_HOVER = 'transition-colors duration-300 hover:bg-[#232119]'
const CHIP = 'rounded-full bg-card transition-colors duration-200 hover:bg-[#2a2820]'

function Section({ children, id, pad }: { children: ReactNode; id?: string; pad?: string }): JSX.Element {
  return (
    <section id={id} className={id ? 'scroll-mt-28' : undefined}>
      <div className={cn('mx-auto w-full max-w-[1480px] px-5 md:px-8 lg:px-12', pad ?? 'py-[clamp(48px,5vw,80px)]')}>
        {children}
      </div>
    </section>
  )
}

function SectionHead({ title, blurb }: { title: string; blurb?: string }): JSX.Element {
  return (
    <Motion
      className="mb-[clamp(28px,4vw,56px)] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
      {...reveal}
    >
      <h2 className="font-display max-w-[20ch] text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.06] font-medium tracking-[-0.03em] text-balance text-cream">
        {title}
      </h2>
      {blurb ? <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">{blurb}</p> : null}
    </Motion>
  )
}

export function CapabilitiesHubComponent(cms: Partial<CapabilitiesHubBlock> = {}): JSX.Element {
  const CAPABILITIES = cms.capabilities?.length
    ? cms.capabilities.map((c) => ({
        name: c.name ?? '',
        slug: c.slug ?? '',
        body: c.body ?? '',
        tags: (c.tags ?? []).map((t) => t.tag ?? ''),
      }))
    : DEFAULT_CAPABILITIES
  const COMBINATIONS = cms.combinations?.length
    ? cms.combinations.map((c) => ({
        tag: c.tag ?? '',
        title: c.title ?? '',
        body: c.body ?? '',
        caps: (c.caps ?? []).map((x) => x.cap ?? ''),
      }))
    : DEFAULT_COMBINATIONS
  const STANDARD = cms.standard?.length
    ? cms.standard.map((s) => ({ title: s.title ?? '', body: s.body ?? '' }))
    : DEFAULT_STANDARD

  const heroHeading = cms.heroHeading || 'Every discipline. One standard.'
  const heroSub =
    cms.heroSub ||
    'The technical practices behind everything we build and run. Each has a named lead, house standards, and work in production to show for it.'
  const framingLead = cms.framingLead || 'A capability, to us, is not a keyword on a services page.'
  const framingLeadMuted = cms.framingLeadMuted || 'It’s a practice we run in production.'
  const framingBody =
    cms.framingBody ||
    'Each one below has people who own it, methods we can defend, and clients who can vouch for it. We only list what we currently run for clients — nothing aspirational, nothing outsourced to a slide.'
  const indexHeading = cms.indexHeading || 'What we practice'
  const indexBlurb =
    cms.indexBlurb ||
    'Eight practices, one bar. Open any of them for the methods, the standards, and the work behind it.'
  const combosHeading = cms.combosHeading || 'They ship together'
  const combosBlurb =
    cms.combosBlurb ||
    'Most engagements draw on several capabilities at once. A modernization is never just cloud. A product is never just interface.'
  const standardHeading = cms.standardHeading || 'One standard across them all'
  const ctaHeading = cms.ctaHeading || 'Not sure which capability you need?'
  const ctaBody =
    cms.ctaBody ||
    "Most people aren't — that's our job. Describe the problem in your own words, and we'll bring the right practices to the first call."

  return (
    <div className="w-full pb-24 lg:pb-32">
      {/* ── HERO ─────────────────────────────────────────────────────────────────────────── */}
      <Section pad="pt-[clamp(32px,6vh,72px)] pb-[clamp(48px,7vh,80px)]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <Motion className="flex flex-col gap-7" {...reveal}>
              <h1 className="font-display max-w-[15ch] text-[clamp(2.75rem,7vw,6rem)] leading-[1.01] font-medium tracking-[-0.04em] text-cream">
                {heroHeading}
              </h1>
              <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-body">{heroSub}</p>
            </Motion>

            <Motion className="mt-12 flex flex-wrap gap-2.5 lg:mt-16" {...reveal}>
              {CAPABILITIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`#${c.slug}`}
                  className={cn(
                    'inline-flex items-center px-4 py-2 text-[13.5px] text-body hover:text-cream',
                    CHIP,
                    FOCUS_RING,
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </Motion>
          </div>

          {/* The Living Engineering Network. Decorative; NOT wrapped in Motion (it committed an
              initial opacity 0 that never cleared under reduced-motion / no-JS). */}
          <div className="hidden lg:block">
            <NetworkMark />
          </div>
        </div>
      </Section>

      {/* ── FRAMING ──────────────────────────────────────────────────────────────────────── */}
      <Section>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <RevealText
            className="max-w-[36ch] font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.26] tracking-[-0.025em] text-cream"
            segments={[{ text: framingLead }, { text: framingLeadMuted, className: 'text-body' }]}
          />
          <Motion {...reveal}>
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-body">{framingBody}</p>
          </Motion>
        </div>
      </Section>

      {/* ── THE INDEX (centerpiece) ──────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead title={indexHeading} blurb={indexBlurb} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CAPABILITIES.map((c, i) => (
            <Motion key={c.slug} className="h-full" {...revealItem(i)}>
              <Link
                id={c.slug}
                href={`/capabilities/${c.slug}`}
                className={cn(
                  'group flex h-full scroll-mt-28 flex-col gap-3 p-7 lg:p-8',
                  PANEL,
                  PANEL_HOVER,
                  FOCUS_RING,
                )}
              >
                <div className="flex items-start justify-between gap-6">
                  <h3 className="font-display max-w-[18ch] text-[clamp(1.375rem,2.2vw,1.75rem)] leading-[1.12] font-medium tracking-[-0.02em] text-cream md:min-h-[2.24em]">
                    {c.name}
                  </h3>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden
                    className="mt-1 shrink-0 text-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </div>

                <p className="max-w-[52ch] text-[15.5px] leading-relaxed text-body">{c.body}</p>

                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-cream/[0.055] px-2.5 py-1 text-[11px] tracking-[0.03em] text-subtle transition-colors duration-300 group-hover:text-body"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── COMBINATIONS ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead title={combosHeading} blurb={combosBlurb} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMBINATIONS.map((combo, i) => (
            <Motion key={combo.title} className="h-full" {...revealItem(i)}>
              <Link
                href="/work"
                className={cn('group flex h-full min-h-[340px] flex-col p-8', PANEL, PANEL_HOVER, FOCUS_RING)}
              >
                <span className="text-[11px] uppercase tracking-[0.12em] text-subtle">{combo.tag}</span>
                <h3 className="mt-4 font-display text-[20px] font-medium leading-snug tracking-[-0.02em] text-cream">
                  {combo.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">{combo.body}</p>

                <div className="mt-7 flex flex-col gap-2 rounded-lg bg-cream/[0.03] px-5 py-4">
                  {combo.caps.map((name) => (
                    <span key={name} className="text-[13px] text-body">
                      {name}
                    </span>
                  ))}
                </div>

                <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-cream">
                  Read the case study
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── THE STANDARD ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionHead title={standardHeading} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STANDARD.map((item, i) => (
            <Motion key={item.title} className={cn('flex h-full flex-col gap-2 p-7', PANEL)} {...revealItem(i)}>
              <h3 className="text-[18px] font-medium tracking-[-0.01em] text-cream">{item.title}</h3>
              <p className="text-[15px] leading-relaxed text-body">{item.body}</p>
            </Motion>
          ))}
        </div>
      </Section>

      {/* ── CTA (signature noise-gradient moment) ────────────────────────────────────────── */}
      <Section pad="py-0">
        <Motion tag="div" className="relative overflow-hidden rounded-xl p-10 lg:p-16" {...reveal}>
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
            <h2 className="max-w-[16ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-cream">
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
                  'inline-flex items-center justify-center rounded-md bg-cream/[0.10] px-6 py-3 text-[15px] font-medium text-cream transition-colors duration-300 hover:bg-cream/[0.18]',
                  FOCUS_RING,
                )}
              >
                See our work
              </Link>
            </div>
          </div>
        </Motion>
      </Section>
    </div>
  )
}
